import { useMemo, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, HardDrive, Maximize } from "lucide-react";
import type { LocalSession } from "@/lib/types";

interface VideoPreviewProps {
  file: File;
  session: LocalSession;
  onTimeUpdate?: (currentTime: number) => void;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoPreview({ file, session, onTimeUpdate }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Reuse the session's objectUrl if available; otherwise create one from the file
  const ownUrl = useMemo(() => session.objectUrl ?? URL.createObjectURL(file), [file, session.objectUrl]);
  
  useEffect(() => {
    // Only revoke if we created our own URL (not the session's shared one)
    if (!session.objectUrl) {
      return () => URL.revokeObjectURL(ownUrl);
    }
    return undefined;
  }, [ownUrl, session.objectUrl]);

  return (
    <div className="flex flex-col h-full bg-zinc-50/50">
      <div className="relative aspect-video bg-black rounded-t-xl overflow-hidden shadow-inner group">
        <video 
          ref={videoRef}
          src={ownUrl} 
          controls 
          controlsList="nodownload"
          className="w-full h-full object-contain"
          onTimeUpdate={(e) => onTimeUpdate?.((e.target as HTMLVideoElement).currentTime)}
          onSeeked={(e) => onTimeUpdate?.((e.target as HTMLVideoElement).currentTime)}
        />
      </div>
      
      <div className="p-4 md:p-6 bg-card rounded-b-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg truncate max-w-[200px] sm:max-w-[300px]" title={session.filename}>
            {session.filename}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">Ready for extraction</p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border-none font-medium">
            <Clock className="w-3 h-3 mr-1.5" />
            {formatDuration(session.duration)}
          </Badge>
          {(session.width && session.height) && (
            <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border-none font-medium">
              <Maximize className="w-3 h-3 mr-1.5" />
              {session.width}x{session.height}
            </Badge>
          )}
          <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border-none font-medium">
            <HardDrive className="w-3 h-3 mr-1.5" />
            {formatBytes(session.size)}
          </Badge>
        </div>
      </div>
    </div>
  );
}
