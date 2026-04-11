import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileVideo, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import type { LocalSession } from "@/lib/types";

interface VideoUploaderProps {
  onUploadSuccess: (session: LocalSession) => void;
  onFileSelect: (file: File) => void;
}

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;

/**
 * Read video metadata locally using a hidden <video> element.
 * No server upload required.
 */
function readLocalMetadata(file: File): Promise<LocalSession> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    const url = URL.createObjectURL(file);
    video.src = url;

    video.addEventListener("loadedmetadata", () => {
      const session: LocalSession = {
        sessionId: crypto.randomUUID(),
        filename: file.name,
        size: file.size,
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        sourceFile: file,
        objectUrl: url,
      };
      // Don't revoke — objectUrl is used for preview
      resolve(session);
    }, { once: true });

    video.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video metadata. The file may be corrupted or unsupported."));
    }, { once: true });
  });
}

export function VideoUploader({ onUploadSuccess, onFileSelect }: VideoUploaderProps) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setErrorMessage(null);

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage("Please select a video smaller than 500MB.");
      return;
    }

    onFileSelect(file);
    setProgress(20);
    setIsLoading(true);

    try {
      setProgress(50);
      const session = await readLocalMetadata(file);
      setProgress(100);
      onUploadSuccess(session);
    } catch (error: unknown) {
      setProgress(0);
      const message =
        error instanceof Error
          ? error.message
          : "Could not read this video. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [onFileSelect, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
      "video/quicktime": [".mov"],
      "video/webm": [".webm"],
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  const actionText = isMobile
    ? "Tap to select video"
    : isDragActive
    ? "Drop video to load"
    : "Drag & drop your video or Browse";

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative flex flex-col items-center justify-center p-10 transition-all
          border-2 border-zinc-200 bg-white rounded-2xl
          md:border-2 md:border-dashed md:border-slate-200 md:rounded-[2rem] md:bg-transparent md:p-16
          ${isDragActive ? "border-primary bg-primary/5 md:border-primary md:bg-primary/5" : "border-zinc-200 bg-white md:border-zinc-200 md:bg-zinc-50 md:hover:border-zinc-300 md:hover:bg-zinc-100/50"}
          ${isLoading ? "pointer-events-none opacity-80" : "cursor-pointer"}
        `}
      >
        <input {...getInputProps()} />

        <div className="px-6 py-16 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center max-w-sm w-full"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Reading video…</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Reading metadata locally — nothing leaves your device.
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
                <h3 className="text-xl font-semibold mb-2">{actionText}</h3>
                <p className="text-sm text-muted-foreground max-w-[260px] mx-auto mb-6">
                  Supports MP4, MOV, and WEBM. Processed locally — no upload needed.
                </p>
                {!isMobile && (
                  <div className="px-6 py-2.5 rounded-full bg-white border shadow-sm text-sm font-medium text-foreground hover:shadow-md transition-shadow">
                    Browse Files
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {errorMessage && (
        <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}
