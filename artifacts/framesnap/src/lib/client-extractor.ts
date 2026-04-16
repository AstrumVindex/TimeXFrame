// ─── Client-side frame extraction via Canvas API ─────────────────────────────
// Processes one frame at a time (sequential) to avoid RAM spikes on mobile.

import type { LocalFrame } from "@/lib/types";
import { createUuid } from "@/lib/uuid";

/** Maximum canvas width on mobile devices to avoid GPU memory limits. */
const MOBILE_MAX_WIDTH = 1280;

export interface ExtractionOptions {
  /** Output format: "image/jpeg", "image/png", or "image/webp". */
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  /** Quality 0-1 for jpeg/webp (ignored for png). */
  quality: number;
  /** Whether the device is mobile (triggers resolution cap). */
  isMobile: boolean;
}

export interface ExtractionProgress {
  current: number;
  total: number;
  /** 0-100 */
  percent: number;
}

/**
 * Compute the list of timestamps to extract, respecting startTime / endTime /
 * skipFirstSeconds for each extraction mode.
 */
export function computeTimestamps(opts: {
  mode: "interval" | "timestamp" | "framecount";
  duration: number;
  interval?: number;
  timestamps?: number[];
  frameCount?: number;
  startTime?: number;
  endTime?: number;
  skipFirstSeconds?: number;
}): number[] {
  const skip = opts.skipFirstSeconds ?? 0;
  const start = Math.max(opts.startTime ?? 0, skip);
  const end = opts.endTime ?? opts.duration;
  const span = Math.max(0, end - start);

  if (opts.mode === "interval") {
    const iv = opts.interval ?? 5;
    const result: number[] = [];
    for (let t = start; t <= end; t += iv) {
      result.push(Math.round(t * 1000) / 1000);
    }
    return result;
  }

  if (opts.mode === "timestamp") {
    return (opts.timestamps ?? []).filter((t) => t >= start && t <= end);
  }

  // framecount
  const count = opts.frameCount ?? 10;
  if (count <= 1) return [start];
  const step = span / (count - 1);
  return Array.from({ length: count }, (_, i) =>
    Math.round((start + i * step) * 1000) / 1000,
  );
}

/**
 * Parse a "HH:MM:SS" string into total seconds.
 */
export function parseHMS(hms: string): number {
  const parts = hms.trim().split(":");
  if (parts.length !== 3) return NaN;
  return Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2]);
}

/**
 * Map UI format string ("jpg" | "png" | "webp") to a MIME type.
 */
export function formatToMime(format: "jpg" | "png" | "webp"): ExtractionOptions["mimeType"] {
  switch (format) {
    case "jpg": return "image/jpeg";
    case "png": return "image/png";
    case "webp": return "image/webp";
  }
}

/**
 * Seek a video element to a specific time and wait until a frame is available.
 */
function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      resolve();
    };
    const onError = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      reject(new Error(`Failed to seek to ${time}s`));
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    video.currentTime = time;
  });
}

/**
 * Render the current video frame to a canvas and return a Blob.
 */
function captureFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  opts: ExtractionOptions,
): Promise<Blob> {
  // Compute output dimensions (adaptive resolution for mobile)
  let w = video.videoWidth;
  let h = video.videoHeight;
  if (opts.isMobile && w > MOBILE_MAX_WIDTH) {
    const scale = MOBILE_MAX_WIDTH / w;
    w = MOBILE_MAX_WIDTH;
    h = Math.round(h * scale);
  }
  canvas.width = w;
  canvas.height = h;

  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(video, 0, 0, w, h);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("canvas.toBlob returned null"));
      },
      opts.mimeType,
      opts.mimeType === "image/png" ? undefined : opts.quality,
    );
  });
}

/**
 * Yield to the browser between frames so the UI thread stays responsive.
 * Uses a 10ms delay to allow the browser to paint new content.
 */
function yieldToUI(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 10));
}

/**
 * Extract frames from a local File at the given timestamps.
 *
 * - Creates a hidden `<video>` with `URL.createObjectURL(file)` — zero upload.
 * - Processes one frame at a time (sequential loop) to keep mobile RAM low.
 * - Returns `LocalFrame[]` whose `.url` is a Blob URL and `.blob` holds the raw Blob.
 * - Caller is responsible for revoking `.url` when done.
 */
export async function extractFramesClient(
  file: File,
  timestamps: number[],
  opts: ExtractionOptions,
  onProgress?: (p: ExtractionProgress) => void,
  signal?: AbortSignal,
  onFrame?: (frame: LocalFrame) => void,
): Promise<LocalFrame[]> {
  if (timestamps.length === 0) return [];

  // Create a hidden video element
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  const videoUrl = URL.createObjectURL(file);
  video.src = videoUrl;

  // Wait for metadata
  await new Promise<void>((resolve, reject) => {
    video.addEventListener("loadeddata", () => resolve(), { once: true });
    video.addEventListener("error", () => reject(new Error("Could not load video for extraction.")), { once: true });
  });

  // Reuse one canvas + context for the entire pass
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");

  const ext = opts.mimeType.split("/")[1] === "jpeg" ? "jpg" : opts.mimeType.split("/")[1];
  const frames: LocalFrame[] = [];

  try {
    for (let i = 0; i < timestamps.length; i++) {
      if (signal?.aborted) throw new DOMException("Extraction aborted", "AbortError");

      const ts = timestamps[i];

      await seekTo(video, ts);
      const blob = await captureFrame(video, canvas, ctx, opts);
      const blobUrl = URL.createObjectURL(blob);
      const id = createUuid();

      const frame: LocalFrame = {
        id,
        url: blobUrl,
        filename: `frame-${String(i + 1).padStart(4, "0")}.${ext}`,
        timestamp: ts,
        suggested: false,
        blob,
      };

      frames.push(frame);
      onFrame?.(frame);

      onProgress?.({
        current: i + 1,
        total: timestamps.length,
        percent: Math.round(((i + 1) / timestamps.length) * 100),
      });

      // 10ms delay to let the browser paint the new frame to the UI
      await yieldToUI();
    }
  } finally {
    // Cleanup the hidden video element
    video.pause();
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(videoUrl);
  }

  return frames;
}
