import { useCallback, useId, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileVideo, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import type { LocalSession } from "@/lib/types";
import { createUuid } from "@/lib/uuid";

interface VideoUploaderProps {
  onUploadSuccess: (session: LocalSession) => void;
  onFileSelect: (file: File) => void;
}

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;
const VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".mov",
  ".webm",
  ".m4v",
  ".mkv",
  ".avi",
  ".mpg",
  ".mpeg",
  ".ogv",
  ".3gp",
]);

function getLowercaseExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1) return "";
  return fileName.slice(dotIndex).toLowerCase();
}

function isVideoFile(file: File): boolean {
  const mime = file.type.toLowerCase();
  if (mime.startsWith("video/")) return true;
  return VIDEO_EXTENSIONS.has(getLowercaseExtension(file.name));
}

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
        sessionId: createUuid(),
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
  const inputId = useId();
  const helperId = useId();
  const titleId = useId();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setErrorMessage(null);

    if (!isVideoFile(file)) {
      setErrorMessage("Please select a video file only.");
      return;
    }

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
          : "Could not read this file as a video. Please try another file.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [onFileSelect, onUploadSuccess]);

  const onDropRejected = useCallback(() => {
    setErrorMessage("Only video files are allowed.");
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles: 1,
    multiple: false,
    disabled: isLoading,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps({
          role: "button",
          tabIndex: isLoading ? -1 : 0,
          "aria-label": "Upload video",
          "aria-labelledby": titleId,
          "aria-describedby": helperId,
          "aria-keyshortcuts": "Enter Space",
          onClick: () => {
            if (!isLoading) open();
          },
          onKeyDown: (event) => {
            if (isLoading) return;
            const key = event.key;
            if (key === " " || key === "Spacebar" || key === "Space") {
              event.preventDefault();
              return;
            }
            if (key === "Enter" || key === "NumpadEnter") {
              event.preventDefault();
              open();
            }
          },
          onKeyUp: (event) => {
            if (isLoading) return;
            const key = event.key;
            if (key === " " || key === "Spacebar" || key === "Space") {
              event.preventDefault();
              open();
            }
          },
        })}
        className={`
          relative flex flex-col items-center justify-center p-10 rounded-2xl border-2 border-dashed transition-all duration-200
          md:rounded-[2rem] md:p-16
          border-zinc-400 bg-white shadow-[0_1px_0_rgba(255,255,255,0.75)_inset,0_8px_24px_rgba(15,23,42,0.06)]
          focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white
          ${isDragActive ? "border-zinc-900 bg-zinc-100 shadow-[0_10px_30px_rgba(15,23,42,0.12)]" : "hover:border-zinc-600 hover:bg-zinc-50"}
          ${isLoading ? "pointer-events-none opacity-80" : "cursor-pointer"}
        `}
      >
        <input
          id={inputId}
          {...getInputProps({
            // Restrict native file picker to video entries (hide images/documents)
            accept: "video/*,.mp4,.mov,.webm,.m4v,.mkv,.avi,.mpg,.mpeg,.ogv,.3gp",
            "aria-describedby": helperId,
          })}
        />
        <p id={helperId} className="sr-only">
          Drop your video here, or press Enter or Space to browse files.
          Supports MP4, MOV, and WEBM. Processed locally on your device.
        </p>

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
                <h3 className="text-xl font-semibold mb-2">Reading video...</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Reading metadata locally - nothing leaves your device.
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
                  ${isDragActive ? "bg-zinc-900 text-white" : "bg-white shadow-sm border border-zinc-300 text-zinc-500"}
                `}
                >
                  {isDragActive ? <UploadCloud className="w-8 h-8" /> : <FileVideo className="w-8 h-8" />}
                </div>
                <h3 id={titleId} className="text-2xl font-semibold mb-2 text-zinc-900">
                  Drop your video here
                </h3>
                <p className="text-sm text-zinc-600 mb-1">or click to browse files</p>
                {!isMobile ? (
                  <label
                    htmlFor={inputId}
                    className="px-6 py-2.5 rounded-full bg-zinc-900 border border-zinc-900 shadow-sm text-sm font-semibold text-white hover:bg-zinc-800 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-all cursor-pointer"
                  >
                    Browse Files
                  </label>
                ) : null}
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
