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
  getFrameTimestamp,
  computeSharpness,
  computeBrightness,
  timestampToSeconds,
  UPLOADS_DIR,
  FRAMES_DIR,
} from "../services/ffmpeg.js";

const router: IRouter = Router();

// Max file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Allowed video MIME types
const ALLOWED_MIME_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

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

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
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

// POST /upload - Upload a video file
router.post(
  "/upload",
  upload.single("video"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({
          error: "No file uploaded",
          message: "Please select a video file to upload.",
        });
        return;
      }

      // Get video metadata using ffprobe
      const metadata = await getVideoMetadata(req.file.path);

      // Generate a session ID (use the filename UUID as session ID)
      const sessionId = path.basename(req.file.filename, path.extname(req.file.filename));

      res.json({
        sessionId,
        filename: req.file.originalname,
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        size: req.file.size,
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
    const { sessionId, mode, timestamp, interval, quality = 85 } = req.body;

    if (!sessionId) {
      res.status(400).json({ error: "Missing sessionId", message: "Session ID is required." });
      return;
    }

    if (!mode || !["timestamp", "interval"].includes(mode)) {
      res.status(400).json({ error: "Invalid mode", message: "Mode must be 'timestamp' or 'interval'." });
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
    let intervalSeconds: number | undefined;

    if (mode === "timestamp") {
      if (!timestamp) {
        res.status(400).json({ error: "Missing timestamp", message: "Timestamp is required for timestamp mode." });
        return;
      }
      // Extract single frame at timestamp
      const filename = await extractFrameAtTimestamp(videoPath, sessionId, timestamp, quality);
      filenames = [filename];
    } else {
      // Interval mode
      const iv = parseFloat(interval);
      if (isNaN(iv) || iv <= 0) {
        res.status(400).json({ error: "Invalid interval", message: "Interval must be a positive number in seconds." });
        return;
      }
      intervalSeconds = iv;
      filenames = await extractFramesAtInterval(videoPath, sessionId, iv, quality);
    }

    const sessionFramesDir = path.join(FRAMES_DIR, sessionId);

    // Build frame objects with analysis
    const frames = await Promise.all(
      filenames.map(async (filename, idx) => {
        const framePath = path.join(sessionFramesDir, filename);
        const frameTimestamp =
          mode === "timestamp"
            ? timestampToSeconds(timestamp)
            : getFrameTimestamp(filename, intervalSeconds, 0);

        // Compute quality metrics for smart suggestions
        const [sharpness, brightness] = await Promise.all([
          computeSharpness(framePath),
          computeBrightness(framePath),
        ]);

        // Mark as suggested if both sharpness and brightness are above thresholds
        const suggested = sharpness >= 40 && brightness >= 20 && brightness <= 85;

        return {
          id: `${sessionId}_${idx}`,
          filename,
          url: `/api/frames/${sessionId}/${filename}`,
          timestamp: frameTimestamp,
          suggested,
          sharpness: Math.round(sharpness),
          brightness: Math.round(brightness),
        };
      })
    );

    res.json({
      sessionId,
      frameCount: frames.length,
      frames,
    });
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
    const jpgFiles = files.filter((f) => f.endsWith(".jpg")).sort();

    const frames = jpgFiles.map((filename, idx) => ({
      id: `${sessionId}_${idx}`,
      filename,
      url: `/api/frames/${sessionId}/${filename}`,
      timestamp: getFrameTimestamp(filename),
      suggested: false,
      sharpness: 50,
      brightness: 50,
    }));

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
    const { sessionId, filename } = req.params;

    // Security: prevent path traversal
    if (
      sessionId.includes("..") ||
      filename.includes("..") ||
      !filename.endsWith(".jpg")
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

    res.setHeader("Content-Type", "image/jpeg");
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
    const { sessionId, frameId } = req.params;

    // Validate no path traversal
    if (sessionId.includes("..") || frameId.includes("..")) {
      res.status(400).json({ error: "Invalid request", message: "Invalid parameters." });
      return;
    }

    // frameId is in format "sessionId_idx" — resolve to filename
    const sessionFramesDir = path.join(FRAMES_DIR, sessionId);
    const allFiles = await fs.readdir(sessionFramesDir).catch(() => []);
    const sortedFiles = allFiles.filter((f) => f.endsWith(".jpg")).sort();

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
    const { sessionId } = req.params;
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
    const sortedFiles = allFiles.filter((f) => f.endsWith(".jpg")).sort();

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
    const sortedFiles = allFiles.filter((f) => f.endsWith(".jpg")).sort();

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
