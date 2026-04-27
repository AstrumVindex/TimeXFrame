import { memo, startTransition, useState, useCallback, useEffect, useMemo } from "react";
import type { LocalFrame } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { Download, Sparkles, Trash2, Loader2, Image as ImageIcon, X, ArrowDownToLine, ChevronLeft, ChevronRight } from "lucide-react";
import JSZip from "jszip";

interface FrameGalleryProps {
  sessionId: string;
  frames: LocalFrame[];
  hasExtracted: boolean;
  extractionVersion: number;
  onDeleteFrames?: (ids: string[]) => void;
}

function revokeIfBlobUrl(url: string) {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
}

// ─── Direct single-frame download ────────────────────────────────────────────

function downloadFrame(frame: LocalFrame) {
  const a = document.createElement("a");
  a.href = frame.url;
  a.download = frame.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function processInChunks<T>(items: T[], chunkSize: number, fn: (item: T) => void) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    chunk.forEach(fn);
    if (i + chunkSize < items.length) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
  }
}

interface FrameTileProps {
  frame: LocalFrame;
  isSelected: boolean;
  isMobile: boolean;
  onToggleSelection: (id: string) => void;
  onDeleteFrame: (frame: LocalFrame, e: React.MouseEvent) => void;
  onDownloadFrame: (frame: LocalFrame, e: React.MouseEvent) => void;
  onPreviewFrame: (frame: LocalFrame) => void;
}

const FrameTile = memo(function FrameTile({
  frame,
  isSelected,
  isMobile,
  onToggleSelection,
  onDeleteFrame,
  onDownloadFrame,
  onPreviewFrame,
}: FrameTileProps) {
  return (
    <div
      className={`
        group relative rounded-xl overflow-hidden aspect-video border transition-all duration-300
        ${isSelected
          ? "ring-4 ring-primary border-primary shadow-md"
          : "border-border shadow-sm hover:shadow-md hover:border-zinc-300 bg-zinc-100"
        }
      `}
    >
      <img
        src={frame.url}
        alt={`Frame at ${formatTime(frame.timestamp)}`}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
        onClick={() => onPreviewFrame(frame)}
      />

      <div className={`absolute inset-0 transition-colors duration-300 pointer-events-none ${isSelected ? "bg-black/10" : "bg-black/0 group-hover:bg-black/25"}`} />

      <div className={`absolute top-2.5 right-2.5 transition-opacity duration-200 z-10 ${isSelected || isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection(frame.id);
          }}
          className="focus:outline-none"
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => {}}
            className="w-5 h-5 rounded-full border-2 border-white bg-black/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary shadow-sm cursor-pointer"
          />
        </button>
      </div>

      {!isSelected && (
        <div className={`absolute top-2.5 left-2.5 z-10 transition-opacity duration-200 flex gap-1.5 ${isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          <button
            onClick={(e) => onDeleteFrame(frame, e)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm hover:bg-red-500 text-white transition-colors"
            title="Delete frame"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => onDownloadFrame(frame, e)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm hover:bg-white/20 text-white transition-colors"
            title="Download this frame"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {frame.suggested && !isSelected && !isMobile && (
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none group-hover:opacity-0 transition-opacity duration-200">
          <Badge variant="secondary" className="bg-amber-100/90 backdrop-blur-sm text-amber-800 border-amber-200 shadow-sm font-medium text-[10px] px-1.5 py-0.5">
            <Sparkles className="w-2.5 h-2.5 mr-1" /> Suggested
          </Badge>
        </div>
      )}

      <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-xs font-mono font-medium z-10 pointer-events-none">
        {formatTime(frame.timestamp)}
      </div>
    </div>
  );
});

// ─── Lightbox Modal ───────────────────────────────────────────────────────────

interface LightboxProps {
  frame: LocalFrame | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  total?: number;
  isMobile?: boolean;
}

function Lightbox({ frame, onClose, onPrev, onNext, currentIndex, total, isMobile = false }: LightboxProps) {
  const hasPrev = !!onPrev && (currentIndex ?? 0) > 0;
  const hasNext = !!onNext && (currentIndex ?? 0) < (total ?? 1) - 1;

  // Keyboard navigation: ESC, ArrowLeft, ArrowRight
  useEffect(() => {
    if (!frame) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev?.();
      if (e.key === "ArrowRight" && hasNext) onNext?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [frame, onClose, onPrev, onNext, hasPrev, hasNext]);

  if (!frame) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar: close + download */}
        <div className="absolute -top-11 left-0 right-0 flex items-center justify-between">
          <span className="text-white/50 text-xs font-mono">{frame.filename}</span>
          <div className="flex items-center gap-3">
            {total !== undefined && total > 1 && (
              <span className="text-white/40 text-xs font-mono">{(currentIndex ?? 0) + 1} / {total}</span>
            )}
            <button
              onClick={() => downloadFrame(frame)}
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm"
            >
              <ArrowDownToLine className="w-4 h-4" /> Download
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm"
            >
              <X className="w-4 h-4" /> Close
            </button>
          </div>
        </div>

        {/* Image */}
        <img
          src={frame.url}
          alt={`Frame at ${formatTime(frame.timestamp)}`}
          className="w-full rounded-xl shadow-2xl object-contain max-h-[80vh]"
        />

        {/* Left arrow */}
        {hasPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className={[
              "absolute top-1/2 -translate-y-1/2 w-11 h-11 md:w-10 md:h-10 flex items-center justify-center rounded-full",
              "bg-black/55 md:bg-white/10 hover:bg-black/70 md:hover:bg-white/25 text-white transition-colors",
              isMobile ? "left-2" : "left-0 md:-translate-x-14",
            ].join(" ")}
            aria-label="Previous frame"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Right arrow */}
        {hasNext && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className={[
              "absolute top-1/2 -translate-y-1/2 w-11 h-11 md:w-10 md:h-10 flex items-center justify-center rounded-full",
              "bg-black/55 md:bg-white/10 hover:bg-black/70 md:hover:bg-white/25 text-white transition-colors",
              isMobile ? "right-2" : "right-0 md:translate-x-14",
            ].join(" ")}
            aria-label="Next frame"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Timestamp label */}
        <div className="absolute bottom-4 left-4 px-3 py-1 rounded-lg bg-black/70 backdrop-blur text-white text-sm font-mono">
          {formatTime(frame.timestamp)}
        </div>

        {/* Suggested badge */}
        {frame.suggested && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-amber-100/90 text-amber-800 border-amber-200 text-xs">
              <Sparkles className="w-3 h-3 mr-1" /> Suggested
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Gallery ─────────────────────────────────────────────────────────────

export function FrameGallery({ sessionId, frames, hasExtracted, extractionVersion, onDeleteFrames }: FrameGalleryProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSuggestedOnly, setShowSuggestedOnly] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [previewFrame, setPreviewFrame] = useState<LocalFrame | null>(null);
  const isMobile = useIsMobile();

  // Reset local selection/deletion when a new extraction runs
  useEffect(() => {
    if (extractionVersion === 0) return;
    setDeletedIds(new Set());
    setSelectedIds(new Set());
  }, [extractionVersion]);

  // Delete a single frame (local only)
  const handleDeleteFrame = useCallback(
    async (frame: LocalFrame, e: React.MouseEvent) => {
      e.stopPropagation();
      revokeIfBlobUrl(frame.url);
      setDeletedIds((prev) => new Set([...prev, frame.id]));
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(frame.id); return next; });
      onDeleteFrames?.([frame.id]);
    },
    [onDeleteFrames],
  );

  // Bulk delete selected frames
  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setIsDeletingBulk(true);
    try {
      const ids = Array.from(selectedIds);
      const frameMap = new Map(frames.map((f) => [f.id, f] as const));

      await processInChunks(ids, 60, (id) => {
        const frame = frameMap.get(id);
        if (frame) revokeIfBlobUrl(frame.url);
      });

      startTransition(() => {
        setDeletedIds((prev) => new Set([...prev, ...ids]));
        setSelectedIds(new Set());
      });
      onDeleteFrames?.(ids);
    } finally {
      setIsDeletingBulk(false);
    }
  }, [selectedIds, frames, onDeleteFrames]);

  const allFrames = useMemo(
    () => frames.filter((f) => !deletedIds.has(f.id)),
    [frames, deletedIds],
  );
  const visibleFrames = useMemo(
    () => allFrames.filter((f) => (showSuggestedOnly ? f.suggested : true)),
    [allFrames, showSuggestedOnly],
  );

  if (!hasExtracted) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-100 rounded-2xl bg-zinc-50/50">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border mb-4">
          <ImageIcon className="w-8 h-8 text-zinc-300" />
        </div>
        <h3 className="text-xl font-semibold text-zinc-900 mb-2">No frames yet</h3>
        <p className="text-muted-foreground max-w-[300px]">
          Configure your settings above and click "Start Extraction" to begin.
        </p>
      </div>
    );
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === visibleFrames.length && visibleFrames.length > 0) {
      setSelectedIds(new Set());
    } else {
      startTransition(() => {
        setSelectedIds(new Set(visibleFrames.map((f) => f.id)));
      });
    }
  };

  const handleDownloadZip = async () => {
    if (selectedIds.size === 0) return;
    setIsZipping(true);
    try {
      const selected = frames.filter((f) => selectedIds.has(f.id));

      if (selected.length === 1) {
        downloadFrame(selected[0]);
        setSelectedIds(new Set());
        return;
      }

      // Build a real ZIP from blobs using JSZip
      const zip = new JSZip();
      for (const frame of selected) {
        if (frame.blob) {
          zip.file(frame.filename, frame.blob);
        } else {
          // Fetch from blob URL if raw blob isn't stored
          const resp = await fetch(frame.url);
          const data = await resp.blob();
          zip.file(frame.filename, data);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `frames-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setSelectedIds(new Set());
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6 relative pb-24">
      {/* Lightbox modal */}
      <Lightbox
        frame={previewFrame}
        onClose={() => setPreviewFrame(null)}
        isMobile={isMobile}
        currentIndex={previewFrame ? visibleFrames.findIndex((f) => f.id === previewFrame.id) : 0}
        total={visibleFrames.length}
        onPrev={() => {
          if (!previewFrame) return;
          const idx = visibleFrames.findIndex((f) => f.id === previewFrame.id);
          if (idx > 0) setPreviewFrame(visibleFrames[idx - 1]);
        }}
        onNext={() => {
          if (!previewFrame) return;
          const idx = visibleFrames.findIndex((f) => f.id === previewFrame.id);
          if (idx < visibleFrames.length - 1) setPreviewFrame(visibleFrames[idx + 1]);
        }}
      />

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold">Extracted Frames</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Showing {visibleFrames.length} of {allFrames.length} frames
          </p>
        </div>

        <div className="flex w-full sm:w-auto flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 bg-white border px-3 sm:px-4 py-2.5 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2">
            <Switch
              id="suggested"
              checked={showSuggestedOnly}
              onCheckedChange={setShowSuggestedOnly}
              className="data-[state=checked]:bg-amber-500"
            />
            <Label htmlFor="suggested" className="font-medium cursor-pointer flex items-center gap-1.5 text-sm sm:text-base">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Suggested Only
            </Label>
          </div>
          <div className="w-full h-px sm:w-px sm:h-6 bg-zinc-200" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="flex text-sm font-medium w-full sm:w-auto justify-center"
          >
            {selectedIds.size === visibleFrames.length && visibleFrames.length > 0 ? "Deselect All" : "Select All"}
          </Button>
        </div>
      </div>

      {/* Frame grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {visibleFrames.map((frame) => (
          <FrameTile
            key={frame.id}
            frame={frame}
            isSelected={selectedIds.has(frame.id)}
            isMobile={isMobile}
            onToggleSelection={toggleSelection}
            onDeleteFrame={handleDeleteFrame}
            onDownloadFrame={(target, e) => {
              e.stopPropagation();
              downloadFrame(target);
            }}
            onPreviewFrame={setPreviewFrame}
          />
        ))}
      </div>

      {visibleFrames.length === 0 && (
        <div className="w-full py-16 text-center text-muted-foreground">
          No frames match your filters.
        </div>
      )}

      {/* Floating Action Bar */}
      {selectedIds.size > 0 && (
          <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-auto max-w-2xl bg-zinc-900 text-white px-3 sm:px-6 py-2.5 sm:py-4 rounded-2xl sm:rounded-full shadow-2xl flex items-center justify-between sm:justify-start gap-2 sm:gap-4 z-50 ring-1 ring-white/10">
            <span className="font-semibold text-xs sm:text-sm whitespace-nowrap">{selectedIds.size} selected</span>
            <div className="w-px h-5 bg-zinc-700 hidden sm:block" />

            <Button
              variant="ghost" size="sm"
              className="text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full text-xs sm:text-sm px-2.5 sm:px-3"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>

            <Button
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold text-xs sm:text-sm px-2.5 sm:px-3"
              onClick={handleBulkDelete}
              disabled={isDeletingBulk}
            >
              {isDeletingBulk ? <Loader2 className="w-4 h-4 sm:mr-1.5 animate-spin" /> : <Trash2 className="w-4 h-4 sm:mr-1.5" />}
              Delete
            </Button>

            <Button
              size="sm"
              className="bg-white text-zinc-900 hover:bg-zinc-100 rounded-full font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)] text-xs sm:text-sm px-2.5 sm:px-3"
              onClick={handleDownloadZip}
              disabled={isZipping}
            >
              {isZipping ? <Loader2 className="w-4 h-4 sm:mr-1.5 animate-spin" /> : <Download className="w-4 h-4 sm:mr-1.5" />}
              Download ZIP
            </Button>
          </div>
        )}
    </div>
  );
}
