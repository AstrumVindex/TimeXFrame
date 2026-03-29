import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";

const execAsync = promisify(exec);

// Base directories for uploads and extracted frames
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const FRAMES_DIR = path.join(process.cwd(), "frames");

// Ensure directories exist
export async function ensureDirectories() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(FRAMES_DIR, { recursive: true });
}

// Get video metadata (duration, dimensions) using ffprobe
export async function getVideoMetadata(filePath: string): Promise<{
  duration: number;
  width: number;
  height: number;
}> {
  const cmd = `ffprobe -v quiet -print_format json -show_streams "${filePath}"`;
  const { stdout } = await execAsync(cmd);
  const data = JSON.parse(stdout);

  // Find the video stream
  const videoStream = data.streams?.find(
    (s: { codec_type: string }) => s.codec_type === "video"
  );

  if (!videoStream) {
    throw new Error("No video stream found in file");
  }

  // Parse duration from stream or format
  let duration = 0;
  if (videoStream.duration) {
    duration = parseFloat(videoStream.duration);
  } else {
    // Try format duration
    const fmtCmd = `ffprobe -v quiet -print_format json -show_format "${filePath}"`;
    const { stdout: fmtOut } = await execAsync(fmtCmd);
    const fmtData = JSON.parse(fmtOut);
    duration = parseFloat(fmtData.format?.duration || "0");
  }

  return {
    duration,
    width: videoStream.width || 0,
    height: videoStream.height || 0,
  };
}

// Extract a single frame at a specific timestamp (hh:mm:ss format)
export async function extractFrameAtTimestamp(
  videoPath: string,
  sessionId: string,
  timestamp: string,
  quality: number = 85
): Promise<string> {
  const sessionFramesDir = path.join(FRAMES_DIR, sessionId);
  await fs.mkdir(sessionFramesDir, { recursive: true });

  // Convert timestamp to seconds for the filename
  const seconds = timestampToSeconds(timestamp);
  const filename = `frame_${String(Math.round(seconds * 1000)).padStart(10, "0")}.jpg`;
  const outputPath = path.join(sessionFramesDir, filename);

  // FFmpeg command to extract a single frame at the given timestamp
  const cmd = `ffmpeg -y -ss "${timestamp}" -i "${videoPath}" -vframes 1 -q:v ${Math.round(((100 - quality) / 100) * 31) + 1} "${outputPath}"`;
  await execAsync(cmd);

  return filename;
}

// Extract frames at regular intervals (every X seconds)
export async function extractFramesAtInterval(
  videoPath: string,
  sessionId: string,
  intervalSeconds: number,
  quality: number = 85
): Promise<string[]> {
  const sessionFramesDir = path.join(FRAMES_DIR, sessionId);
  await fs.mkdir(sessionFramesDir, { recursive: true });

  // FFmpeg -vf fps filter: extract 1 frame every intervalSeconds
  const fps = 1 / intervalSeconds;
  const outputPattern = path.join(sessionFramesDir, "frame_%010d.jpg");

  // q:v controls JPEG quality: 1 is best, 31 is worst
  const qValue = Math.round(((100 - quality) / 100) * 31) + 1;
  const cmd = `ffmpeg -y -i "${videoPath}" -vf "fps=${fps}" -q:v ${qValue} "${outputPattern}"`;
  await execAsync(cmd);

  // List all extracted frames in order
  const files = await fs.readdir(sessionFramesDir);
  return files.filter((f) => f.endsWith(".jpg")).sort();
}

// Get the timestamp (in seconds) for each extracted frame based on filename
export function getFrameTimestamp(
  filename: string,
  intervalSeconds?: number,
  startIndex: number = 0
): number {
  // Filenames like frame_0000000001.jpg where the number is the frame index
  const match = filename.match(/frame_(\d+)\.jpg/);
  if (!match) return 0;

  const frameNum = parseInt(match[1], 10);

  if (intervalSeconds !== undefined) {
    // For interval mode: frame_N corresponds to N*interval seconds
    // Frame numbers start at 1 in FFmpeg output
    return (frameNum - 1 + startIndex) * intervalSeconds;
  } else {
    // For timestamp mode: the frameNum encodes seconds * 1000
    return frameNum / 1000;
  }
}

// Compute a simple sharpness score using Laplacian variance via FFmpeg
// Returns a score 0-100 (higher = sharper)
export async function computeSharpness(framePath: string): Promise<number> {
  try {
    // Use FFmpeg to compute the Laplacian-like measure via blurdetect filter
    // blurdetect outputs a "blur" metric; low blur = high sharpness
    const cmd = `ffprobe -v error -select_streams v:0 -show_entries frame_tags=lavfi.blur -f lavfi -i "movie=${framePath},blurdetect=high=0.01:block_pct=10" 2>&1 | head -20`;
    const { stdout } = await execAsync(cmd);

    // Parse blur value from output
    const match = stdout.match(/lavfi\.blur=([0-9.]+)/);
    if (match) {
      const blur = parseFloat(match[1]);
      // blur ranges roughly 0 (not blurry) to 1 (very blurry)
      // Convert to sharpness: higher = sharper
      return Math.max(0, Math.min(100, (1 - blur) * 100));
    }

    return 50; // Default if we can't compute
  } catch {
    return 50; // Default on error
  }
}

// Compute brightness by sampling pixel values via FFmpeg
// Returns a score 0-100 (higher = brighter)
export async function computeBrightness(framePath: string): Promise<number> {
  try {
    // Use FFmpeg to get mean luminance
    const cmd = `ffprobe -v error -select_streams v:0 -show_entries frame_tags=lavfi.signalstats.YAVG -f lavfi -i "movie=${framePath},signalstats=stat=tout+vrep+brng" 2>&1`;
    const { stdout } = await execAsync(cmd);

    const match = stdout.match(/lavfi\.signalstats\.YAVG=([0-9.]+)/);
    if (match) {
      // YAVG is mean luma 0-255
      const yavg = parseFloat(match[1]);
      return Math.round((yavg / 255) * 100);
    }

    return 50; // Default
  } catch {
    return 50; // Default on error
  }
}

// Convert hh:mm:ss or mm:ss or ss to seconds
export function timestampToSeconds(ts: string): number {
  const parts = ts.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0] || 0;
}

// Clean up session files (video + frames)
export async function cleanupSession(sessionId: string, videoPath: string) {
  try {
    await fs.unlink(videoPath);
  } catch {
    // Ignore if file doesn't exist
  }
  try {
    const sessionFramesDir = path.join(FRAMES_DIR, sessionId);
    await fs.rm(sessionFramesDir, { recursive: true, force: true });
  } catch {
    // Ignore
  }
}

// Auto-cleanup sessions older than the given age (milliseconds)
export async function cleanupOldSessions(maxAgeMs: number = 3600000) {
  try {
    const now = Date.now();
    const framesDir = FRAMES_DIR;
    const entries = await fs.readdir(framesDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const sessionPath = path.join(framesDir, entry.name);
        const stat = await fs.stat(sessionPath);
        if (now - stat.mtimeMs > maxAgeMs) {
          await fs.rm(sessionPath, { recursive: true, force: true });
        }
      }
    }

    // Also clean up uploads
    const uploadEntries = await fs.readdir(UPLOADS_DIR);
    for (const file of uploadEntries) {
      const filePath = path.join(UPLOADS_DIR, file);
      const stat = await fs.stat(filePath);
      if (now - stat.mtimeMs > maxAgeMs) {
        await fs.unlink(filePath).catch(() => {});
      }
    }
  } catch {
    // Ignore errors during cleanup
  }
}

export { UPLOADS_DIR, FRAMES_DIR };
