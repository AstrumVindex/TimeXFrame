import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetFrames, useDownloadZip } from "@workspace/api-client-react";
import type { UploadResponse, Frame } from "@workspace/api-client-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, Sparkles, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FrameGalleryProps {
  session: UploadResponse;
  hasExtracted: boolean;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

export function FrameGallery({ session, hasExtracted }: FrameGalleryProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSuggestedOnly, setShowSuggestedOnly] = useState(false);
  
  const { data: framesData, isLoading } = useGetFrames(
    { sessionId: session.sessionId },
    { query: { enabled: hasExtracted } }
  );

  const { mutate: downloadZip, isPending: isZipping } = useDownloadZip();

  if (!hasExtracted) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-100 rounded-2xl bg-zinc-50/50">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border mb-4">
          <ImageIcon className="w-8 h-8 text-zinc-300" />
        </div>
        <h3 className="text-xl font-semibold text-zinc-900 mb-2">No frames yet</h3>
        <p className="text-muted-foreground max-w-[300px]">
          Configure your settings above and click "Extract Frames" to begin.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading extracted frames...</p>
      </div>
    );
  }

  const allFrames = framesData?.frames || [];
  const visibleFrames = allFrames.filter(f => showSuggestedOnly ? f.suggested : true);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === visibleFrames.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleFrames.map(f => f.id)));
    }
  };

  const handleDownloadZip = () => {
    if (selectedIds.size === 0) return;
    
    downloadZip(
      { data: { sessionId: session.sessionId, frameIds: Array.from(selectedIds) } },
      {
        onSuccess: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `framesnap-${session.sessionId.slice(0,6)}.zip`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          
          toast({ title: "Download started", description: `Zipped ${selectedIds.size} frames.` });
          setSelectedIds(new Set());
        },
        onError: () => {
          toast({ title: "Download failed", description: "Could not create ZIP file.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-6 relative pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold">Extracted Frames</h2>
          <p className="text-muted-foreground text-sm mt-1">Showing {visibleFrames.length} of {allFrames.length} frames</p>
        </div>
        
        <div className="flex items-center gap-6 bg-white border px-4 py-2.5 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2">
            <Switch 
              id="suggested" 
              checked={showSuggestedOnly} 
              onCheckedChange={setShowSuggestedOnly}
              className="data-[state=checked]:bg-amber-500"
            />
            <Label htmlFor="suggested" className="font-medium cursor-pointer flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Suggested Only
            </Label>
          </div>
          <div className="w-px h-6 bg-zinc-200 hidden sm:block" />
          <Button variant="ghost" size="sm" onClick={handleSelectAll} className="hidden sm:flex text-sm font-medium">
            {selectedIds.size === visibleFrames.length && visibleFrames.length > 0 ? "Deselect All" : "Select All"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        <AnimatePresence>
          {visibleFrames.map((frame) => {
            const isSelected = selectedIds.has(frame.id);
            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={frame.id}
                className={`
                  group relative rounded-xl overflow-hidden aspect-video border transition-all duration-300
                  ${isSelected ? 'ring-4 ring-primary border-primary shadow-md' : 'border-border shadow-sm hover:shadow-md hover:border-zinc-300 bg-zinc-100'}
                `}
                onClick={() => toggleSelection(frame.id)}
              >
                <img 
                  src={frame.url} 
                  alt={`Frame at ${formatTime(frame.timestamp)}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                <div className={`
                  absolute inset-0 transition-colors duration-300 pointer-events-none
                  ${isSelected ? 'bg-black/10' : 'bg-black/0 group-hover:bg-black/20'}
                `} />

                <div className={`
                  absolute top-3 right-3 transition-opacity duration-200 z-10
                  ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                `}>
                  <Checkbox 
                    checked={isSelected} 
                    onCheckedChange={() => toggleSelection(frame.id)} 
                    className="w-6 h-6 rounded-full border-2 border-white bg-black/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary shadow-sm" 
                  />
                </div>

                {frame.suggested && (
                  <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    <Badge variant="secondary" className="bg-amber-100/90 backdrop-blur-sm text-amber-800 border-amber-200 shadow-sm font-medium">
                      <Sparkles className="w-3 h-3 mr-1"/> Suggested
                    </Badge>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-xs font-mono font-medium z-10 pointer-events-none">
                  {formatTime(frame.timestamp)}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {visibleFrames.length === 0 && (
        <div className="w-full py-16 text-center text-muted-foreground">
          No frames match your filters.
        </div>
      )}

      {/* Floating Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 z-50 ring-1 ring-white/10"
          >
            <span className="font-semibold">{selectedIds.size} frames selected</span>
            <div className="w-px h-6 bg-zinc-700" />
            <Button 
              variant="ghost" 
              className="text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full" 
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>
            <Button 
              className="bg-white text-zinc-900 hover:bg-zinc-100 rounded-full font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
              onClick={handleDownloadZip} 
              disabled={isZipping}
            >
              {isZipping ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Download ZIP
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
