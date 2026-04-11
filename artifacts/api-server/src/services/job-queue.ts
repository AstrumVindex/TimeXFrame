import { getVideoMetadata } from "./ffmpeg.js";

export interface JobStatus {
  sessionId: string;
  status: "pending" | "processing" | "completed" | "failed";
  metadata?: {
    duration: number;
    width: number;
    height: number;
    fps: number;
  };
  error?: string;
  filename: string;
  filePath: string;
  createdAt: number;
}

// In-memory job queue for development
const jobs = new Map<string, JobStatus>();
const processing = new Set<string>();

export function createJob(sessionId: string, filename: string, filePath: string): JobStatus {
  const job: JobStatus = {
    sessionId,
    status: "pending",
    filename,
    filePath,
    createdAt: Date.now(),
  };
  jobs.set(sessionId, job);
  return job;
}

export function getJobStatus(sessionId: string): JobStatus | undefined {
  return jobs.get(sessionId);
}

export async function processJob(sessionId: string): Promise<void> {
  const job = jobs.get(sessionId);
  if (!job) return;

  // Prevent duplicate processing
  if (processing.has(sessionId)) return;
  processing.add(sessionId);

  try {
    job.status = "processing";

    // Call FFprobe to get metadata
    const metadata = await getVideoMetadata(job.filePath);
    job.metadata = metadata;
    job.status = "completed";
  } catch (err) {
    job.error = err instanceof Error ? err.message : "Unknown error";
    job.status = "failed";
  } finally {
    processing.delete(sessionId);
  }
}

export function startBackgroundProcessing(sessionId: string): void {
  // Start processing in background without waiting
  processJob(sessionId).catch((err) => {
    const job = jobs.get(sessionId);
    if (job) {
      job.error = err instanceof Error ? err.message : "Background processing failed";
      job.status = "failed";
    }
  });
}

// Cleanup old jobs after 24 hours
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [sessionId, job] of jobs.entries()) {
    if (now - job.createdAt > maxAge) {
      jobs.delete(sessionId);
    }
  }
}, 60 * 60 * 1000); // Check every hour
