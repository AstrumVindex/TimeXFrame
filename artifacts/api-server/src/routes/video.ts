import { Router, type IRouter, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { createReadStream } from "fs";
import archiver from "archiver";
import { randomUUID } from "crypto";
import {
  ensureDirectories,
  getVideoMetadata,
  extractFrameAtTimestamp,
  extractFramesAtInterval,
  extractMultipleTimestamps,
  extractFramesByCount,
  extractSmartFrames,
  getFrameTimestamp,
  computeSharpness,
  computeBrightness,
  UPLOADS_DIR,
  FRAMES_DIR,
} from "../services/ffmpeg.js";
import {
  createJob,
  getJobStatus,
  startBackgroundProcessing,
} from "../services/job-queue.js";

const router: IRouter = Router();

// Max file size: 500MB
const MAX_FILE_SIZE = 500 * 1024 * 1024;
// Allow 50MB per chunk
const MAX_CHUNK_SIZE = 50 * 1024 * 1024;
const CHUNK_UPLOADS_DIR = path.join(UPLOADS_DIR, ".chunks");

// Allowed video MIME types
const ALLOWED_MIME_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

function isAllowedVideoMimeType(mimeType: string | undefined): boolean {
  return !!mimeType && ALLOWED_MIME_TYPES.includes(mimeType);
}

function isSafeUploadId(value: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(value);
}

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await ensureDirectories();
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    // Use a UUID to avoid conflicts
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const uploadSingle = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (isAllowedVideoMimeType(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported format. Please upload MP4, MOV, or WEBM files.`
        )
      );
    }
  },
});

const chunkStorage = multer.diskStorage({
  destination: async (req, _file, cb) => {
    try {
      await ensureDirectories();
      // uploadId will be validated in the request handler
      // For now, we'll use a temporary name and rename after validation
      cb(null, CHUNK_UPLOADS_DIR);
    } catch (err) {
      cb(err as Error, "");
    }
  },
  filename: (_req, file, cb) => {
    const chunkIndex = _req.body?.chunkIndex;
    const uploadId = _req.body?.uploadId;
    const index = Number.parseInt(String(chunkIndex), 10);
    const padded = Number.isInteger(index) && index >= 0 ? String(index).padStart(5, "0") : `chunk-${Date.now()}`;
    // Include uploadId in filename to organize chunks
    const filename = uploadId ? `${uploadId}-${padded}.part` : `${padded}.part`;
    cb(null, filename);
  },
});

const chunkUpload = multer({
  storage: chunkStorage,
  limits: { fileSize: MAX_CHUNK_SIZE },
});

router.post(
  "/upload-chunk",
  chunkUpload.single("chunk"),
  async (req: Request, res: Response) => {
    try {
      const { uploadId, chunkIndex, totalChunks } = req.body;

      if (!req.file) {
        res.status(400).json({
          error: "Missing chunk",
          message: "No upload chunk was received.",
        });
        return;
      }

      if (req.file.size > MAX_CHUNK_SIZE) {
        res.status(413).json({
          error: "Upload failed",
          message: "Chunk size is too large. Please try a smaller file or chunking strategy.",
        });
        return;
      }

      if (typeof uploadId !== "string" || !isSafeUploadId(uploadId)) {
        req.log?.error({ uploadId, type: typeof uploadId, body: req.body }, "Invalid uploadId received");
        res.status(400).json({
          error: "Invalid uploadId",
          message: `Upload session ID is missing or invalid. Received: ${JSON.stringify({ uploadId, type: typeof uploadId })}`,
        });
        return;
      }

      const index = Number.parseInt(String(chunkIndex), 10);
      const total = Number.parseInt(String(totalChunks), 10);

      if (!Number.isInteger(index) || index < 0 || !Number.isInteger(total) || total < 1) {
        res.status(400).json({
          error: "Invalid chunk info",
          message: "Chunk index or total chunk count is invalid.",
        });
        return;
      }

      if (!req.file || typeof req.file.path !== "string") {
        res.status(500).json({
          error: "Upload failed",
          message: "Chunk storage failed; file path not available.",
        });
        return;
      }

      // Move the chunk to the correct directory structure
      const chunkDir = path.join(CHUNK_UPLOADS_DIR, uploadId);
      await fs.mkdir(chunkDir, { recursive: true });
      
      const finalChunkPath = path.join(chunkDir, `${String(index).padStart(5, "0")}.part`);
      await fs.rename(req.file.path, finalChunkPath);

      res.status(200).json({ ok: true, chunkIndex: index, totalChunks: total });
    } catch (err) {
      req.log?.error({ err }, "Upload chunk error");
      res.status(500).json({
        error: "Upload failed",
        message:
          err instanceof Error ? err.message : "Failed to store uploaded chunk.",
      });
    }
  },
);

router.get("/upload-status/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (typeof sessionId !== "string" || !isSafeUploadId(sessionId)) {
      res.status(400).json({
        error: "Invalid sessionId",
        message: "Session ID is missing or invalid.",
      });
      return;
    }

    const job = getJobStatus(sessionId);

    if (!job) {
      res.status(404).json({
        error: "Not found",
        message: "Job not found. Session may have expired.",
      });
      return;
    }

    // Only return metadata if job is completed
    const response: Record<string, unknown> = {
      sessionId: job.sessionId,
      filename: job.filename,
      status: job.status,
      createdAt: job.createdAt,
    };

    if (job.status === "completed" && job.metadata) {
      response.metadata = job.metadata;
    }

    if (job.status === "failed" && job.error) {
      response.error = job.error;
    }

    res.json(response);
  } catch (err) {
    req.log?.error({ err }, "Status check error");
    res.status(500).json({
      error: "Internal error",
      message: "Failed to check job status.",
    });
  }
});

router.post("/upload-complete", async (req: Request, res: Response) => {
  try {
    const { uploadId, filename, totalChunks } = req.body;

    if (typeof uploadId !== "string" || !isSafeUploadId(uploadId)) {
      res.status(400).json({
        error: "Invalid uploadId",
        message: "Upload session ID is missing or invalid.",
      });
      return;
    }

    const total = Number.parseInt(String(totalChunks), 10);
    if (!Number.isInteger(total) || total < 1) {
      res.status(400).json({
        error: "Invalid totalChunks",
        message: "Total chunk count is invalid.",
      });
      return;
    }

    const chunkDir = path.join(CHUNK_UPLOADS_DIR, uploadId);
    const partFiles = (await fs.readdir(chunkDir))
      .filter((file) => file.endsWith(".part"))
      .sort();

    if (partFiles.length !== total) {
      res.status(400).json({
        error: "Incomplete upload",
        message: `Expected ${total} chunks but received ${partFiles.length}. Please upload again.`,
      });
      return;
    }

    const originalName =
      typeof filename === "string" && filename.trim() ? path.basename(filename) : "video.mp4";
    const ext = path.extname(originalName) || ".mp4";
    const finalPath = path.join(UPLOADS_DIR, `${uploadId}${ext}`);

    await fs.rm(finalPath, { force: true }).catch(() => {});

    for (const partFile of partFiles) {
      const partPath = path.join(chunkDir, partFile);
      const buffer = await fs.readFile(partPath);
      await fs.appendFile(finalPath, buffer);
    }

    const stat = await fs.stat(finalPath);
    if (stat.size > MAX_FILE_SIZE) {
      await fs.rm(finalPath, { force: true }).catch(() => {});
      await fs.rm(chunkDir, { recursive: true, force: true }).catch(() => {});
      res.status(413).json({
        error: "Upload failed",
        message: "Please upload a video smaller than 100MB.",
      });
      return;
    }

    const metadata = await getVideoMetadata(finalPath);
    await fs.rm(chunkDir, { recursive: true, force: true }).catch(() => {});

    res.json({
      sessionId: uploadId,
      filename: originalName,
      duration: metadata.duration,
      width: metadata.width,
      height: metadata.height,
      size: stat.size,
    });
  } catch (err) {
    req.log?.error({ err }, "Upload finalize error");
    res.status(500).json({
      error: "Upload failed",
      message:
        err instanceof Error ? err.message : "Failed to assemble uploaded video.",
    });
  }
});

// POST /upload - Upload a video file
const uploadSingleStorage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await ensureDirectories();
      cb(null, UPLOADS_DIR);
    } catch (err) {
      cb(err as Error, "");
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".mp4";
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage: uploadSingleStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (isAllowedVideoMimeType(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported format. Please upload MP4, MOV, or WEBM files.`,
        ),
      );
    }
  },
});

router.post(
  "/upload",
  uploadSingle.single("video"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({
          error: "No file uploaded",
          message: "Please select a video file to upload.",
        });
        return;
      }

      if (req.file.size > MAX_FILE_SIZE) {
        res.status(413).json({
          error: "Upload failed",
          message: "This video is too large for the current web upload limit. Please try a smaller file.",
        });
        return;
      }

      // Generate a session ID
      const sessionId = path.basename(req.file.filename, path.extname(req.file.filename));

      // Create job but DON'T wait for metadata extraction
      createJob(sessionId, req.file.originalname, req.file.path);
      
      // Start background processing without waiting
      startBackgroundProcessing(sessionId);

      // Return immediately with sessionId
      res.json({
        sessionId,
        filename: req.file.originalname,
        size: req.file.size,
        message: "Upload received. Analyzing video in background...",
      });
    } catch (err) {
      req.log?.error({ err }, "Upload error");
      res.status(500).json({
        error: "Upload failed",
        message:
          err instanceof Error ? err.message : "Failed to process uploaded video.",
      });
    }
  }
);

// POST /extract - Extract frames from uploaded video
router.post("/extract", async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      mode,
      // Interval mode
      interval,
      startTime,
      endTime,
      // Timestamp mode
      timestamp,
      timestamps,
      // Frame count mode
      frameCount,
      // Smart mode
      avoidBlurry,
      preferBright,
      detectSceneChanges,
      // Output
      quality = 100,
      format = "jpg",
      skipFirstSeconds,
    } = req.body;

    if (!sessionId) {
      res.status(400).json({ error: "Missing sessionId", message: "Session ID is required." });
      return;
    }

    const validModes = ["timestamp", "interval", "framecount", "smart"];
    if (!mode || !validModes.includes(mode)) {
      res.status(400).json({ error: "Invalid mode", message: `Mode must be one of: ${validModes.join(", ")}.` });
      return;
    }

    // Find the uploaded video file
    const uploadFiles = await fs.readdir(UPLOADS_DIR);
    const videoFile = uploadFiles.find((f) => f.startsWith(sessionId));

    if (!videoFile) {
      res.status(404).json({ error: "Not found", message: "Video session not found. Please upload again." });
      return;
    }

    const videoPath = path.join(UPLOADS_DIR, videoFile);
    let filenames: string[] = [];

    // Clear previous frames for this session so each extraction starts fresh
    const sessionFramesDirForClean = path.join(FRAMES_DIR, sessionId);
    try {
      const existingFiles = await fs.readdir(sessionFramesDirForClean);
      await Promise.all(
        existingFiles
          .filter((f) => /\.(jpg|png|webp)$/.test(f))
          .map((f) => fs.unlink(path.join(sessionFramesDirForClean, f)).catch(() => {}))
      );
    } catch {}

    // Resolve effective startTime when skipFirstSeconds is set
    const effectiveStartTime = skipFirstSeconds && !startTime
      ? new Date(skipFirstSeconds * 1000).toISOString().substr(11, 8)
      : startTime;

    if (mode === "timestamp") {
      // Support multiple timestamps — cap at 10 to prevent CPU overload
      let tsList: string[] = Array.isArray(timestamps) && timestamps.length
        ? timestamps
        : timestamp ? [timestamp] : [];

      tsList = tsList.slice(0, 10);

      if (!tsList.length) {
        res.status(400).json({ error: "Missing timestamp", message: "At least one timestamp is required." });
        return;
      }
      filenames = await extractMultipleTimestamps(videoPath, sessionId, tsList, quality, format);

    } else if (mode === "interval") {
      const iv = parseFloat(interval);
      if (isNaN(iv) || iv <= 0) {
        res.status(400).json({ error: "Invalid interval", message: "Interval must be a positive number in seconds." });
        return;
      }
      filenames = await extractFramesAtInterval(videoPath, sessionId, iv, quality, format, effectiveStartTime, endTime);

    } else if (mode === "framecount") {
      const n = parseInt(frameCount, 10);
      if (isNaN(n) || n < 1) {
        res.status(400).json({ error: "Invalid frameCount", message: "Frame count must be at least 1." });
        return;
      }
      filenames = await extractFramesByCount(videoPath, sessionId, n, quality, format, effectiveStartTime, endTime);

    } else if (mode === "smart") {
      filenames = await extractSmartFrames(videoPath, sessionId, {
        quality,
        format,
        detectSceneChanges: !!detectSceneChanges,
        avoidBlurry: !!avoidBlurry,
        preferBright: !!preferBright,
        startTime: effectiveStartTime,
        endTime,
      });
    }

    const sessionFramesDir = path.join(FRAMES_DIR, sessionId);

    // Build frame objects with analysis
    const frames = await Promise.all(
      filenames.map(async (filename, idx) => {
        const framePath = path.join(sessionFramesDir, filename);

        const [sharpness, brightness] = await Promise.all([
          computeSharpness(framePath),
          computeBrightness(framePath),
        ]);

        // Smart mode: apply user-chosen filters as scoring
        let suggested = sharpness >= 40 && brightness >= 20 && brightness <= 85;
        if (mode === "smart") {
          if (avoidBlurry && sharpness < 35) suggested = false;
          if (preferBright && (brightness < 15 || brightness > 90)) suggested = false;
        }

        return {
          id: `${sessionId}_${idx}`,
          filename,
          url: `/api/frames/${sessionId}/${filename}`,
          timestamp: getFrameTimestamp(filename),
          suggested,
          sharpness: Math.round(sharpness),
          brightness: Math.round(brightness),
        };
      })
    );

    res.json({ sessionId, frameCount: frames.length, frames });

  } catch (err) {
    req.log?.error({ err }, "Extract error");
    res.status(500).json({
      error: "Extraction failed",
      message: err instanceof Error ? err.message : "Failed to extract frames.",
    });
  }
});

// GET /frames?sessionId=xxx - List frames for a session
router.get("/frames", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== "string") {
      res.status(400).json({ error: "Missing sessionId", message: "Session ID is required." });
      return;
    }

    const sessionFramesDir = path.join(FRAMES_DIR, sessionId);

    try {
      await fs.access(sessionFramesDir);
    } catch {
      res.status(404).json({ error: "Not found", message: "Session not found." });
      return;
    }

    const files = await fs.readdir(sessionFramesDir);
    const jpgFiles = files.filter((f) => /\.(jpg|png|webp)$/.test(f)).sort();

    const frames = jpgFiles.map((filename, idx) => ({
      id: `${sessionId}_${idx}`,
      filename,
      url: `/api/frames/${sessionId}/${filename}`,
      timestamp: getFrameTimestamp(filename),
      suggested: false,
      sharpness: 50,
      brightness: 50,
    }));

    // Prevent HTTP caching so the gallery always reflects the latest extraction
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.json({ sessionId, frames });
  } catch (err) {
    req.log?.error({ err }, "Get frames error");
    res.status(500).json({
      error: "Failed to list frames",
      message: err instanceof Error ? err.message : "Unknown error.",
    });
  }
});

// GET /frames/:sessionId/:filename - Serve individual frame images
router.get("/frames/:sessionId/:filename", async (req: Request, res: Response) => {
  try {
    const sessionId = String(req.params.sessionId);
    const filename = String(req.params.filename);

    // Security: prevent path traversal
    if (
      sessionId.includes("..") ||
      filename.includes("..") ||
      !/\.(jpg|png|webp)$/.test(filename)
    ) {
      res.status(400).json({ error: "Invalid request", message: "Invalid file path." });
      return;
    }

    const framePath = path.join(FRAMES_DIR, sessionId, filename);

    try {
      await fs.access(framePath);
    } catch {
      res.status(404).json({ error: "Not found", message: "Frame not found." });
      return;
    }

    const contentType = filename.endsWith(".png") ? "image/png"
      : filename.endsWith(".webp") ? "image/webp"
      : "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    const stream = createReadStream(framePath);
    stream.pipe(res);
  } catch (err) {
    req.log?.error({ err }, "Serve frame error");
    res.status(500).json({ error: "Failed to serve frame", message: "Unknown error." });
  }
});

// DELETE /frames/:sessionId/:frameId - Delete a specific frame
router.delete("/frames/:sessionId/:frameId", async (req: Request, res: Response) => {
  try {
    const sessionId = String(req.params.sessionId);
    const frameId = String(req.params.frameId);

    // Validate no path traversal
    if (sessionId.includes("..") || frameId.includes("..")) {
      res.status(400).json({ error: "Invalid request", message: "Invalid parameters." });
      return;
    }

    // frameId is in format "sessionId_idx" — resolve to filename
    const sessionFramesDir = path.join(FRAMES_DIR, sessionId);
    const allFiles = await fs.readdir(sessionFramesDir).catch(() => []);
    const sortedFiles = allFiles
      .map((f) => String(f))
      .filter((f) => /\.(jpg|png|webp)$/.test(f))
      .sort();

    const idxStr = frameId.replace(`${sessionId}_`, "");
    const idx = parseInt(idxStr, 10);

    if (isNaN(idx) || idx < 0 || idx >= sortedFiles.length) {
      res.status(404).json({ error: "Not found", message: "Frame not found." });
      return;
    }

    const filename = sortedFiles[idx];
    const framePath = path.join(sessionFramesDir, filename);

    await fs.unlink(framePath);
    res.json({ success: true, message: "Frame deleted." });
  } catch (err) {
    req.log?.error({ err }, "Delete frame error");
    res.status(500).json({ error: "Delete failed", message: "Could not delete frame." });
  }
});

// DELETE /frames/:sessionId - Delete multiple frames (bulk)
router.delete("/frames/:sessionId", async (req: Request, res: Response) => {
  try {
    const sessionId = String(req.params.sessionId);
    const { frameIds } = req.body as { frameIds: string[] };

    if (!frameIds || !Array.isArray(frameIds) || frameIds.length === 0) {
      res.status(400).json({ error: "Invalid request", message: "frameIds array is required." });
      return;
    }

    if (sessionId.includes("..")) {
      res.status(400).json({ error: "Invalid request", message: "Invalid session." });
      return;
    }

    const sessionFramesDir = path.join(FRAMES_DIR, sessionId);
    const allFiles = await fs.readdir(sessionFramesDir).catch(() => []);
    const sortedFiles = allFiles
      .map((f) => String(f))
      .filter((f) => /\.(jpg|png|webp)$/.test(f))
      .sort();

    let deletedCount = 0;
    for (const frameId of frameIds) {
      const idxStr = frameId.replace(`${sessionId}_`, "");
      const idx = parseInt(idxStr, 10);
      if (!isNaN(idx) && idx >= 0 && idx < sortedFiles.length) {
        const framePath = path.join(sessionFramesDir, sortedFiles[idx]);
        await fs.unlink(framePath).catch(() => {});
        deletedCount++;
      }
    }

    res.json({ success: true, deleted: deletedCount });
  } catch (err) {
    req.log?.error({ err }, "Bulk delete error");
    res.status(500).json({ error: "Delete failed", message: "Could not delete frames." });
  }
});

// POST /download-zip - Download selected frames as ZIP
router.post("/download-zip", async (req: Request, res: Response) => {
  try {
    const { sessionId, frameIds } = req.body;

    if (!sessionId || !frameIds || !Array.isArray(frameIds) || frameIds.length === 0) {
      res.status(400).json({
        error: "Invalid request",
        message: "Session ID and at least one frame ID are required.",
      });
      return;
    }

    const sessionFramesDir = path.join(FRAMES_DIR, sessionId);

    // Get list of all frames
    const allFiles = await fs.readdir(sessionFramesDir);
    const sortedFiles = allFiles.filter((f) => /\.(jpg|png|webp)$/.test(f)).sort();

    // Map frame IDs to filenames (id = sessionId_idx)
    const selectedFiles: string[] = [];
    for (const frameId of frameIds) {
      const idxStr = frameId.replace(`${sessionId}_`, "");
      const idx = parseInt(idxStr, 10);
      if (!isNaN(idx) && idx >= 0 && idx < sortedFiles.length) {
        selectedFiles.push(sortedFiles[idx]);
      }
    }

    if (selectedFiles.length === 0) {
      res.status(400).json({ error: "No valid frames", message: "No matching frames found." });
      return;
    }

    // Stream a ZIP archive to the response
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="framesnap-frames.zip"`
    );

    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.pipe(res);

    for (const filename of selectedFiles) {
      const framePath = path.join(sessionFramesDir, filename);
      archive.file(framePath, { name: filename });
    }

    await archive.finalize();
  } catch (err) {
    req.log?.error({ err }, "Download ZIP error");
    if (!res.headersSent) {
      res.status(500).json({ error: "ZIP creation failed", message: "Failed to create ZIP archive." });
    }
  }
});

export default router;
