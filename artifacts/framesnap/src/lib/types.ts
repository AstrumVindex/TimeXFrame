// ─── Client-side session & frame types ───────────────────────────────────────

export interface LocalSession {
  sessionId: string;
  filename: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  /** Optional original local file kept only for preview in the workspace UI. */
  sourceFile?: File;
  /** Optional blob URL when a local preview source is needed. */
  objectUrl?: string;
}

export interface LocalFrame {
  id: string;
  /** Frame image URL served by the API or created locally. */
  url: string;
  filename: string;
  /** Timestamp in seconds from the start of the video. */
  timestamp: number;
  suggested: boolean;
  /** Optional raw image blob for local-only workflows. */
  blob?: Blob;
}
