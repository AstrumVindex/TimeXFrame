import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileVideo, Loader2 } from "lucide-react";
import { useUploadVideo } from "@workspace/api-client-react";
import type { UploadResponse } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface VideoUploaderProps {
  onUploadSuccess: (session: UploadResponse) => void;
  onFileSelect: (file: File) => void;
}

export function VideoUploader({ onUploadSuccess, onFileSelect }: VideoUploaderProps) {
  const { toast } = useToast();
  const { mutate: uploadVideo, isPending } = useUploadVideo();
  const [progress, setProgress] = useState(0);

  // Simulate progress bar for better UX during large uploads
  useEffect(() => {
    if (isPending) {
      setProgress(0);
      const timer = setInterval(() => {
        setProgress((old) => Math.min(old + (90 - old) * 0.15, 90));
      }, 300);
      return () => clearInterval(timer);
    } else {
      setProgress(100);
    }
  }, [isPending]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Check size limit (100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a video smaller than 100MB.",
        variant: "destructive",
      });
      return;
    }

    onFileSelect(file);
    
    uploadVideo(
      { data: { video: file } },
      {
        onSuccess: (data) => {
          onUploadSuccess(data);
          toast({
            title: "Upload successful",
            description: "Your video is ready for extraction.",
          });
        },
        onError: () => {
          toast({
            title: "Upload failed",
            description: "There was an error uploading your video. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  }, [uploadVideo, onFileSelect, onUploadSuccess, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/webm': ['.webm'],
    },
    maxFiles: 1,
    disabled: isPending
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ease-out
          ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-zinc-100/50'}
          ${isPending ? 'pointer-events-none opacity-80' : 'cursor-pointer'}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="px-6 py-16 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            {isPending ? (
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
                  Please keep this tab open while we process your file.
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
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors duration-300
                  ${isDragActive ? 'bg-primary text-primary-foreground' : 'bg-white shadow-sm border text-muted-foreground'}
                `}>
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
