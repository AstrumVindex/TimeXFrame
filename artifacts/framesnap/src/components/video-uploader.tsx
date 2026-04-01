import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileVideo, Loader2 } from "lucide-react";
import type { UploadResponse } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface VideoUploaderProps {
  onUploadSuccess: (session: UploadResponse) => void;
  onFileSelect: (file: File) => void;
}

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
const CHUNK_SIZE_BYTES = 4 * 1024 * 1024;

async function readUploadError(response: Response): Promise<string> {
  if (response.status === 413) {
    return "This video is too large for the current web upload limit. Please try a smaller file.";
  }

  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const data = (await response.json()) as { message?: string; error?: string };
      return data.message ?? data.error ?? `Upload failed with HTTP ${response.status}.`;
    }

    const text = (await response.text())
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text ? `HTTP ${response.status}: ${text.slice(0, 200)}` : `Upload failed with HTTP ${response.status}.`;
  } catch {
    return `Upload failed with HTTP ${response.status}.`;
  }
}

async function uploadVideoInChunks(
  file: File,
  onProgress: (value: number) => void,
): Promise<UploadResponse> {
  const uploadId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE_BYTES));

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
    const start = chunkIndex * CHUNK_SIZE_BYTES;
    const end = Math.min(file.size, start + CHUNK_SIZE_BYTES);
    const chunk = file.slice(start, end, file.type || "application/octet-stream");

    const formData = new FormData();
    formData.append("chunk", chunk, file.name);
    formData.append("uploadId", uploadId);
    formData.append("filename", file.name);
    formData.append("chunkIndex", String(chunkIndex));
    formData.append("totalChunks", String(totalChunks));

    const chunkResponse = await fetch("/api/upload-chunk", {
      method: "POST",
      body: formData,
    });

    if (!chunkResponse.ok) {
      throw new Error(await readUploadError(chunkResponse));
    }

    onProgress(Math.max(5, Math.round((end / file.size) * 95)));
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

  if (!finalizeResponse.ok) {
    throw new Error(await readUploadError(finalizeResponse));
  }

  const data = (await finalizeResponse.json()) as UploadResponse;
  onProgress(100);
  return data;
}

export function VideoUploader({ onUploadSuccess, onFileSelect }: VideoUploaderProps) {
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        title: "File too large",
        description: "Please upload a video smaller than 100MB.",
        variant: "destructive",
      });
      return;
    }

    onFileSelect(file);
    setProgress(0);
    setIsUploading(true);

    try {
      const data = await uploadVideoInChunks(file, setProgress);
      onUploadSuccess(data);
    } catch (error: unknown) {
      setProgress(0);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "There was an error uploading your video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [onFileSelect, onUploadSuccess, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
      "video/quicktime": [".mov"],
      "video/webm": [".webm"],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ease-out
          ${isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-zinc-100/50"}
          ${isUploading ? "pointer-events-none opacity-80" : "cursor-pointer"}
        `}
      >
        <input {...getInputProps()} />

        <div className="px-6 py-16 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center max-w-sm w-full"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Uploading video...</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Please keep this tab open while we upload your file safely.
                </p>
                <Progress value={progress} className="h-2 w-full" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center"
              >
                <div
                  className={`
                  w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors duration-300
                  ${isDragActive ? "bg-primary text-primary-foreground" : "bg-white shadow-sm border text-muted-foreground"}
                `}
                >
                  {isDragActive ? <UploadCloud className="w-8 h-8" /> : <FileVideo className="w-8 h-8" />}
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {isDragActive ? "Drop video to upload" : "Drag & drop your video"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-[260px] mx-auto mb-6">
                  Supports MP4, MOV, and WEBM formats up to 100MB.
                </p>
                <div className="px-6 py-2.5 rounded-full bg-white border shadow-sm text-sm font-medium text-foreground hover:shadow-md transition-shadow">
                  Browse Files
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
