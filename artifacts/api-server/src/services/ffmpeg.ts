import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";

const execAsync = promisify(exec);

export const UPLOADS_DIR = path.join(process.cwd(), "uploads");
export const FRAMES_DIR = path.join(process.cwd(), "frames");

export async function ensureDirectories() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(FRAMES_DIR, { recursive: true });
}

// ─── Video metadata ─────────────────────────────────────────────────────────

function parseFrameRate(rate?: string): number {
  if (!rate || rate === "0/0") return 0;
  const [num, den] = rate.split("/").map(Number);
  if (Number.isFinite(num) && Number.isFinite(den) && den > 0) return num / den;
  const direct = Number(rate);
  return Number.isFinite(direct) ? direct : 0;
}

export async function getVideoMetadata(filePath: string) {
  const cmd = `ffprobe -v quiet -print_format json -show_streams -show_format "${filePath}"`;
  const { stdout } = await execAsync(cmd);
  const data = JSON.parse(stdout);
  const videoStream = data.streams?.find((s: { codec_type: string }) => s.codec_type === "video");
  if (!videoStream) throw new Error("No video stream found in file");

  let duration = parseFloat(videoStream.duration || "0");
  if (!duration) duration = parseFloat(data.format?.duration || "0");

  const fps = parseFrameRate(videoStream.avg_frame_rate || videoStream.r_frame_rate);

  return { duration, width: videoStream.width || 0, height: videoStream.height || 0, fps };
}

// ─── Timestamp helpers ───────────────────────────────────────────────────────

export function timestampToSeconds(ts: string): number {
  const parts = ts.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

function secondsToTimestamp(s: number): string {
  const totalMs = Math.max(0, Math.round(s * 1000));
  const h = Math.floor(totalMs / 3_600_000);
  const m = Math.floor((totalMs % 3_600_000) / 60_000);
  const sec = Math.floor((totalMs % 60_000) / 1000);
  const ms = totalMs % 1000;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

// Quality → FFmpeg qv (1 best, 31 worst)
function qualityToQv(quality: number) {
  return Math.max(1, Math.round(((100 - quality) / 100) * 31) + 1);
}

// Extension for format
function formatExt(fmt: string) {
  return fmt === "png" ? "png" : fmt === "webp" ? "webp" : "jpg";
}

// ─── Extraction helpers ──────────────────────────────────────────────────────

async function ensureSessionDir(sessionId: string) {
  const dir = path.join(FRAMES_DIR, sessionId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

async function listFrames(dir: string, ext: string) {
  const files = await fs.readdir(dir);
  return files.filter((f) => f.endsWith(`.${ext}`)).sort();
}

// ─── 1. Single timestamp ─────────────────────────────────────────────────────

export async function extractFrameAtTimestamp(
  videoPath: string,
  sessionId: string,
  timestamp: string,
  quality = 85,
  format = "jpg"
): Promise<string> {
  const dir = await ensureSessionDir(sessionId);
  const ext = formatExt(format);
  const secs = timestampToSeconds(timestamp);
  const filename = `frame_${String(Math.round(secs * 1000)).padStart(10, "0")}.${ext}`;
  const out = path.join(dir, filename);

  let encArgs = format === "png"
    ? `-compression_level 3`
    : format === "webp"
    ? `-quality ${quality}`
    : `-q:v ${qualityToQv(quality)}`;

  // -ss placed AFTER -i for accurate (frame-accurate) seeking
  await execAsync(`ffmpeg -y -i "${videoPath}" -ss "${timestamp}" -frames:v 1 ${encArgs} "${out}"`);
  return filename;
}

// ─── 2. Multiple timestamps ──────────────────────────────────────────────────

export async function extractMultipleTimestamps(
  videoPath: string,
  sessionId: string,
  timestamps: string[],
  quality = 85,
  format = "jpg"
): Promise<string[]> {
  const results: string[] = [];
  for (const ts of timestamps) {
    const fn = await extractFrameAtTimestamp(videoPath, sessionId, ts, quality, format);
    results.push(fn);
  }
  return results;
}

// ─── 3. Interval extraction ──────────────────────────────────────────────────

export async function extractFramesAtInterval(
  videoPath: string,
  sessionId: string,
  intervalSeconds: number,
  quality = 85,
  format = "jpg",
  startTime?: string,
  endTime?: string
): Promise<string[]> {
  const dir = await ensureSessionDir(sessionId);
  const ext = formatExt(format);
  const fps = 1 / intervalSeconds;
  const pattern = path.join(dir, `frame_%010d.${ext}`);

  const ssFlag = startTime ? `-ss "${startTime}"` : "";
  const toFlag = endTime ? `-to "${endTime}"` : "";

  let encArgs = format === "png"
    ? `-compression_level 3`
    : format === "webp"
    ? `-quality ${quality}`
    : `-q:v ${qualityToQv(quality)}`;

  await execAsync(
    `ffmpeg -y ${ssFlag} ${toFlag} -i "${videoPath}" -vf "fps=${fps}" ${encArgs} "${pattern}"`
  );

  return listFrames(dir, ext);
}

// ─── 4. Frame count (evenly distributed) ────────────────────────────────────

export async function extractFramesByCount(
  videoPath: string,
  sessionId: string,
  frameCount: number,
  quality = 85,
  format = "jpg",
  startTime?: string,
  endTime?: string
): Promise<string[]> {
  const meta = await getVideoMetadata(videoPath);
  const start = startTime ? timestampToSeconds(startTime) : 0;
  const end = endTime ? timestampToSeconds(endTime) : meta.duration;
  const duration = Math.max(0, end - start);
  const frameStep = meta.fps > 0 ? 1 / meta.fps : Math.min(0.04, Math.max(duration / Math.max(frameCount, 1), 0.001));
  const safeEnd = duration > frameStep ? end - frameStep : end;
  const usableDuration = Math.max(0, safeEnd - start);

  if (frameCount <= 1) {
    // Just grab the middle frame.
    const mid = secondsToTimestamp(start + usableDuration / 2);
    const fn = await extractFrameAtTimestamp(videoPath, sessionId, mid, quality, format);
    return [fn];
  }

  // Sample from the middle of each evenly sized slice of the timeline.
  const timestamps: string[] = [];
  const step = usableDuration / frameCount;
  for (let i = 0; i < frameCount; i++) {
    const t = start + step * (i + 0.5);
    timestamps.push(secondsToTimestamp(Math.min(t, safeEnd)));
  }

  return extractMultipleTimestamps(videoPath, sessionId, timestamps, quality, format);
}

// ─── 5. Smart extraction (scene-change or interval + scoring) ────────────────

export async function extractSmartFrames(
  videoPath: string,
  sessionId: string,
  options: {
    detectSceneChanges?: boolean;
    avoidBlurry?: boolean;
    preferBright?: boolean;
    quality?: number;
    format?: string;
    startTime?: string;
    endTime?: string;
  }
): Promise<string[]> {
  const dir = await ensureSessionDir(sessionId);
  const { quality = 85, format = "jpg", startTime, endTime, detectSceneChanges } = options;
  const ext = formatExt(format);
  const pattern = path.join(dir, `frame_%010d.${ext}`);

  const ssFlag = startTime ? `-ss "${startTime}"` : "";
  const toFlag = endTime ? `-to "${endTime}"` : "";

  let encArgs = format === "png"
    ? `-compression_level 3`
    : format === "webp"
    ? `-quality ${quality}`
    : `-q:v ${qualityToQv(quality)}`;

  if (detectSceneChanges) {
    // Use FFmpeg scene-change detection — select frames where scene score > 0.35
    await execAsync(
      `ffmpeg -y ${ssFlag} ${toFlag} -i "${videoPath}" -vf "select='gt(scene,0.35)',setpts=N/FRAME_RATE/TB" -vsync vfr ${encArgs} "${pattern}"`
    );
  } else {
    // Extract 1 fps as a baseline for smart scoring
    await execAsync(
      `ffmpeg -y ${ssFlag} ${toFlag} -i "${videoPath}" -vf "fps=1" ${encArgs} "${pattern}"`
    );
  }

  return listFrames(dir, ext);
}

// ─── Frame timestamp from filename ──────────────────────────────────────────

export function getFrameTimestamp(filename: string, intervalSeconds?: number): number {
  const match = filename.match(/frame_(\d+)\./);
  if (!match) return 0;
  const n = parseInt(match[1], 10);
  if (intervalSeconds !== undefined) return (n - 1) * intervalSeconds;
  return n / 1000;
}

// ─── Sharpness & brightness scoring ─────────────────────────────────────────

export async function computeSharpness(framePath: string): Promise<number> {
  try {
    const cmd = `ffprobe -v error -select_streams v:0 -show_entries frame_tags=lavfi.blur -f lavfi -i "movie=${framePath},blurdetect=high=0.01:block_pct=10" 2>&1 | head -20`;
    const { stdout } = await execAsync(cmd);
    const match = stdout.match(/lavfi\.blur=([0-9.]+)/);
    if (match) return Math.max(0, Math.min(100, (1 - parseFloat(match[1])) * 100));
    return 50;
  } catch {
    return 50;
  }
}

export async function computeBrightness(framePath: string): Promise<number> {
  try {
    const cmd = `ffprobe -v error -select_streams v:0 -show_entries frame_tags=lavfi.signalstats.YAVG -f lavfi -i "movie=${framePath},signalstats=stat=tout+vrep+brng" 2>&1`;
    const { stdout } = await execAsync(cmd);
    const match = stdout.match(/lavfi\.signalstats\.YAVG=([0-9.]+)/);
    if (match) return Math.round((parseFloat(match[1]) / 255) * 100);
    return 50;
  } catch {
    return 50;
  }
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

export async function cleanupSession(sessionId: string, videoPath: string) {
  try { await fs.unlink(videoPath); } catch {}
  try { await fs.rm(path.join(FRAMES_DIR, sessionId), { recursive: true, force: true }); } catch {}
}

export async function cleanupOldSessions(maxAgeMs = 3_600_000) {
  try {
    const now = Date.now();
    for (const entry of await fs.readdir(FRAMES_DIR, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const p = path.join(FRAMES_DIR, entry.name);
      if (now - (await fs.stat(p)).mtimeMs > maxAgeMs)
        await fs.rm(p, { recursive: true, force: true });
    }
    for (const file of await fs.readdir(UPLOADS_DIR)) {
      const p = path.join(UPLOADS_DIR, file);
      if (now - (await fs.stat(p)).mtimeMs > maxAgeMs)
        await fs.unlink(p).catch(() => {});
    }
  } catch {}
}
