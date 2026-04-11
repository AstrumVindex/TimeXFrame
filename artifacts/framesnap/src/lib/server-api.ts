import type { LocalFrame, LocalSession } from "@/lib/types";

const CHUNK_SIZE_BYTES = 10 * 1024 * 1024;

interface ExtractServerParams {
  sessionId: string;
  mode: "interval" | "timestamp" | "framecount" | "smart";
  format: "jpg" | "png" | "webp";
  startTime?: string;
  endTime?: string;
  skipFirstSeconds?: number;
  interval?: number;
  timestamps?: string[];
  frameCount?: number;
  avoidBlurry?: boolean;
  preferBright?: boolean;
  detectSceneChanges?: boolean;
}

function ensureOk(response: Response, fallbackMessage: string): Promise<Response> {
  if (response.ok) return Promise.resolve(response);

  return response
    .json()
    .catch(() => null)
    .then((body) => {
      const message =
        body && typeof body === "object" && "message" in body && typeof body.message === "string"
          ? body.message
          : fallbackMessage;
      throw new Error(message);
    });
}

function normalizeFrame(frame: {
  id: string;
  filename: string;
  url: string;
  timestamp: number;
  suggested: boolean;
}): LocalFrame {
  return {
    id: frame.id,
    filename: frame.filename,
    url: frame.url,
    timestamp: frame.timestamp,
    suggested: frame.suggested,
  };
}

export async function uploadVideoToServer(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<LocalSession> {
  const uploadId = globalThis.crypto?.randomUUID?.() ?? `upload-${Date.now()}`;
  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE_BYTES));

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE_BYTES;
    const end = Math.min(start + CHUNK_SIZE_BYTES, file.size);
    const chunk = file.slice(start, end);
    const formData = new FormData();
    formData.append("chunk", chunk, file.name);
    formData.append("uploadId", uploadId);
    formData.append("chunkIndex", String(chunkIndex));
    formData.append("totalChunks", String(totalChunks));

    const response = await fetch("/api/upload-chunk", {
      method: "POST",
      body: formData,
    });

    await ensureOk(response, "Failed to upload video chunk.");
    onProgress?.(Math.round(((chunkIndex + 1) / totalChunks) * 80));
  }

  const finalizeResponse = await fetch("/api/upload-complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uploadId,
      filename: file.name,
      totalChunks,
    }),
  });

  await ensureOk(finalizeResponse, "Failed to finalize uploaded video.");
  onProgress?.(95);

  const body = (await finalizeResponse.json()) as {
    sessionId: string;
    filename: string;
    duration: number;
    width: number;
    height: number;
    size: number;
  };

  onProgress?.(100);

  return {
    sessionId: body.sessionId,
    filename: body.filename,
    duration: body.duration,
    width: body.width,
    height: body.height,
    size: body.size,
  };
}

export async function extractFramesOnServer(
  params: ExtractServerParams,
): Promise<{ sessionId: string; frameCount: number; frames: LocalFrame[] }> {
  const response = await fetch("/api/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  await ensureOk(response, "Failed to extract frames.");
  const body = (await response.json()) as {
    sessionId: string;
    frameCount: number;
    frames: Array<{
      id: string;
      filename: string;
      url: string;
      timestamp: number;
      suggested: boolean;
    }>;
  };

  return {
    sessionId: body.sessionId,
    frameCount: body.frameCount,
    frames: body.frames.map(normalizeFrame),
  };
}

export async function deleteFrameOnServer(sessionId: string, frameId: string): Promise<void> {
  const response = await fetch(`/api/frames/${sessionId}/${frameId}`, {
    method: "DELETE",
  });

  await ensureOk(response, "Failed to delete frame.");
}

export async function deleteFramesOnServer(sessionId: string, frameIds: string[]): Promise<void> {
  const response = await fetch(`/api/frames/${sessionId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ frameIds }),
  });

  await ensureOk(response, "Failed to delete frames.");
}

export async function downloadFramesZipFromServer(
  sessionId: string,
  frameIds: string[],
): Promise<Blob> {
  const response = await fetch("/api/download-zip", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId, frameIds }),
  });

  await ensureOk(response, "Failed to build ZIP download.");
  return response.blob();
}