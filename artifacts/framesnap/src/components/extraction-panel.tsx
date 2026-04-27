import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import type { LocalSession, LocalFrame } from "@/lib/types";
import {
  extractFramesClient,
  computeTimestamps,
  parseHMS,
  formatToMime,
} from "@/lib/client-extractor";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Settings2, ScanLine, Loader2, Plus, X, Timer, Hash,
  Sparkles, Info, Square,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    gtag_report_conversion?: (url?: string) => boolean;
  }
}

interface ExtractionPanelProps {
  session: LocalSession;
  onExtracted: (frames: LocalFrame[]) => void;
  /** Called after each individual frame is extracted so the gallery updates progressively. */
  onFrameExtracted?: (frame: LocalFrame) => void;
  /** Current video playhead time in seconds — auto-fills Start. */
  playheadTime?: number;
}

type Mode = "interval" | "timestamp" | "framecount" | "smart";

const ESTIMATED_MB_PER_FRAME: Record<"jpg" | "png" | "webp", number> = {
  jpg: 0.24,
  png: 0.40,
  webp: 0.18,
};

// Tooltip helper — uses Radix portal so overflow-hidden parents don't clip it
function Tip({ text }: { text: string }) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Tooltip
      open={isMobile ? isOpen : undefined}
      onOpenChange={isMobile ? setIsOpen : undefined}
    >
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Show info"
          onClick={isMobile ? () => setIsOpen((prev) => !prev) : undefined}
          className="inline-flex ml-1 align-middle cursor-help focus:outline-none"
        >
          <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 transition-colors" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[200px] text-xs leading-relaxed bg-zinc-900 text-white rounded-lg px-3 py-2"
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

// Validate HH:MM:SS
function isValidTs(ts: string) {
  return /^\d{1,2}:\d{2}:\d{2}$/.test(ts.trim());
}

function secondsToHMS(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function ExtractionPanel({ session, onExtracted, onFrameExtracted, playheadTime }: ExtractionPanelProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isMobile = useIsMobile();

  const [mode, setMode] = useState<Mode>("interval");

  // Interval mode
  const [interval, setInterval] = useState("5");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Sync the video playhead into the Start time field
  useEffect(() => {
    if (playheadTime != null && playheadTime > 0) {
      setStartTime(secondsToHMS(playheadTime));
    }
  }, [playheadTime]);

  // Timestamp mode — multiple entries
  const [timestampList, setTimestampList] = useState<string[]>(["00:00:05"]);

  // Frame count mode
  const [frameCount, setFrameCount] = useState("10");

  // Smart mode
  const [avoidBlurry, setAvoidBlurry] = useState(true);
  const [preferBright, setPreferBright] = useState(true);
  const [detectScenes, setDetectScenes] = useState(false);

  // Output settings
  const [format, setFormat] = useState<"jpg" | "png" | "webp">("png");

  const trackStartExtractionConversion = useCallback(() => {
    try {
      window.gtag_report_conversion?.();
    } catch {
      // Do not block extraction if tracking is unavailable.
    }
  }, []);

  // ── Estimation ──────────────────────────────────────────────────────────────
  const estimation = useMemo(() => {
    const estimateSize = (frames: number) => `~${(frames * ESTIMATED_MB_PER_FRAME[format]).toFixed(1)} MB`;
    const duration = session.duration || 60;
    const start = startTime && isValidTs(startTime)
      ? startTime.split(":").reduce((a, v, i) => a + Number(v) * [3600, 60, 1][i], 0)
      : 0;
    const end = endTime && isValidTs(endTime)
      ? endTime.split(":").reduce((a, v, i) => a + Number(v) * [3600, 60, 1][i], 0)
      : duration;
    const span = Math.max(1, end - start);

    if (mode === "interval") {
      const iv = parseFloat(interval);
      if (isNaN(iv) || iv <= 0) return null;
      const frames = Math.floor(span / iv) + 1;
      const baseTime = Math.ceil(frames * 0.1);
      return { frames, size: estimateSize(frames), time: `~${baseTime + 20} sec` };
    }
    if (mode === "timestamp") {
      const valid = timestampList.filter(isValidTs).length;
      const baseTime = valid;
      return { frames: valid, size: estimateSize(valid), time: `~${baseTime + 20} sec` };
    }
    if (mode === "framecount") {
      const n = parseInt(frameCount, 10);
      if (isNaN(n) || n <= 0) return null;
      const baseTime = Math.ceil(n * 0.1);
      return { frames: n, size: estimateSize(n), time: `~${baseTime + 20} sec` };
    }
    if (mode === "smart") {
      const baseTime = Math.ceil(span * 0.15);
      return { frames: "Auto", size: "Varies", time: `~${baseTime + 20} sec` };
    }
    return null;
  }, [mode, interval, startTime, endTime, timestampList, frameCount, session.duration, format]);

  // ── Validate ────────────────────────────────────────────────────────────────
  function validate(): string | null {
    if (mode === "interval") {
      const iv = parseFloat(interval);
      if (isNaN(iv) || iv <= 0) return "Enter a valid interval (seconds).";
      if (startTime && !isValidTs(startTime)) return "Start time must be HH:MM:SS.";
      if (endTime && !isValidTs(endTime)) return "End time must be HH:MM:SS.";
    }
    if (mode === "timestamp") {
      if (!timestampList.length || !timestampList.some(isValidTs)) return "Add at least one valid timestamp (HH:MM:SS).";
    }
    if (mode === "framecount") {
      const n = parseInt(frameCount, 10);
      if (isNaN(n) || n < 1) return "Frame count must be at least 1.";
    }
    return null;
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleExtract() {
    const err = validate();
    if (err) {
      setErrorMessage(err);
      return;
    }

    if (!session.sourceFile) {
      setErrorMessage("Original video file is not available. Please select the file again.");
      return;
    }

    setErrorMessage(null);
    setIsExtracting(true);
    setExtractProgress(0);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Build timestamps based on mode
      const parsedStart = startTime ? parseHMS(startTime) : undefined;
      const parsedEnd = endTime ? parseHMS(endTime) : undefined;

      let ts: number[];

      if (mode === "smart") {
        // Smart mode: extract at 1fps baseline, then send blobs to server for scoring
        ts = computeTimestamps({
          mode: "interval",
          duration: session.duration,
          interval: 1,
          startTime: parsedStart,
          endTime: parsedEnd,
        });
      } else if (mode === "timestamp") {
        ts = computeTimestamps({
          mode: "timestamp",
          duration: session.duration,
          timestamps: timestampList.filter(isValidTs).map(parseHMS),
          startTime: parsedStart,
          endTime: parsedEnd,
        });
      } else if (mode === "interval") {
        ts = computeTimestamps({
          mode: "interval",
          duration: session.duration,
          interval: parseFloat(interval),
          startTime: parsedStart,
          endTime: parsedEnd,
        });
      } else {
        // framecount
        ts = computeTimestamps({
          mode: "framecount",
          duration: session.duration,
          frameCount: parseInt(frameCount, 10),
          startTime: parsedStart,
          endTime: parsedEnd,
        });
      }

      if (ts.length === 0) {
        setErrorMessage("No frames to extract with the current settings.");
        return;
      }

      // Fire conversion after extraction successfully starts (post-validation).
      trackStartExtractionConversion();

      // Signal the parent to clear old frames before we start streaming new ones
      onExtracted([]);

      const frames = await extractFramesClient(
        session.sourceFile,
        ts,
        {
          mimeType: formatToMime(format),
          quality: 0.92,
          isMobile: !!isMobile,
        },
        (p) => setExtractProgress(p.percent),
        controller.signal,
        // Progressive: append each frame to the gallery as it's captured
        (frame) => onFrameExtracted?.(frame),
      );

      if (frames.length === 0) {
        setErrorMessage("No frames could be extracted with the current settings.");
        return;
      }

      // For smart mode, send extracted blobs to backend for analysis
      if (mode === "smart") {
        setExtractProgress(95);
        try {
          const scored = await scoreFramesOnServer(frames, {
            avoidBlurry,
            preferBright,
          });
          onExtracted(scored);
        } catch {
          // If server scoring fails, final state already populated progressively
        }
      }

      setExtractProgress(100);
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setErrorMessage("Extraction was cancelled.");
      } else {
        const message = error instanceof Error ? error.message : "An error occurred. Please try again.";
        setErrorMessage(message);
      }
    } finally {
      abortRef.current = null;
      setIsExtracting(false);
      setExtractProgress(0);
    }
  }

  /**
   * Smart mode bridge: send extracted blobs to the server for sharpness scoring.
   */
  async function scoreFramesOnServer(
    frames: LocalFrame[],
    opts: { avoidBlurry: boolean; preferBright: boolean },
  ): Promise<LocalFrame[]> {
    const formData = new FormData();
    formData.append("options", JSON.stringify(opts));
    for (const frame of frames) {
      if (frame.blob) {
        formData.append("frames", frame.blob, frame.filename);
      }
    }

    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Scoring failed");

    const body = (await response.json()) as {
      results: Array<{ filename: string; suggested: boolean }>;
    };

    const suggestions = new Map(
      body.results.map((r) => [r.filename, r.suggested]),
    );

    return frames.map((f) => ({
      ...f,
      suggested: suggestions.get(f.filename) ?? false,
    }));
  }

  // ── Timestamp list helpers ───────────────────────────────────────────────────
  const addTimestamp = () => setTimestampList((p) => p.length < 10 ? [...p, ""] : p);
  const removeTimestamp = (i: number) => setTimestampList((p) => p.filter((_, j) => j !== i));
  const updateTimestamp = (i: number, v: string) =>
    setTimestampList((p) => p.map((t, j) => (j === i ? v : t)));

  const isInvalid = !!validate();
  const countValue = parseInt(frameCount, 10);
  const showHighFrameWarning = mode === "framecount" && !isNaN(countValue) && countValue > 200;
  const estimatedFrames = typeof estimation?.frames === "number" ? estimation.frames : null;
  const showIntervalHighFrameWarning = mode === "interval" && (estimatedFrames ?? 0) > 200;

  return (
    <TooltipProvider delayDuration={200}>
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 md:p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Settings2 className="w-5 h-5 text-zinc-700" />
        <h3 className="text-lg font-bold text-zinc-900">Extraction Settings</h3>
      </div>

      {/* Mode tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-4 bg-zinc-100 rounded-xl p-1 mb-5 h-auto gap-0.5">
          {[
            { value: "interval", icon: Timer, label: "Interval" },
            { value: "timestamp", icon: ScanLine, label: "Timestamp" },
            { value: "framecount", icon: Hash, label: "Count" },
            { value: "smart", icon: Sparkles, label: "Smart" },
          ].map(({ value, icon: Icon, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex flex-col items-center gap-1 py-2 rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1">

          {/* ── Interval ── */}
          <TabsContent value="interval" className="space-y-4 mt-0">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                Every X seconds
                <Tip text="Extract one frame for every N seconds of video duration." />
              </Label>
              <div className="relative">
                <Input
                  type="number" min="0.5" step="0.5"
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  className="pr-12 font-mono bg-zinc-50 border-zinc-200 rounded-xl"
                  placeholder="5"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-medium">sec</span>
              </div>
              {showIntervalHighFrameWarning && (
                <p className="text-[11px] text-muted-foreground">
                  Extracting too many frames can make the website unresponsive. Consider increasing the interval.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                  Start time
                  <Tip text="Leave empty to start from the beginning." />
                </Label>
                <Input
                  type="text" placeholder="00:00:00"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="font-mono text-sm bg-zinc-50 border-zinc-200 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                  End time
                  <Tip text="Leave empty to go until the end." />
                </Label>
                <Input
                  type="text" placeholder="00:01:00"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="font-mono text-sm bg-zinc-50 border-zinc-200 rounded-xl"
                />
              </div>
            </div>
          </TabsContent>

          {/* ── Timestamp ── */}
          <TabsContent value="timestamp" className="space-y-3 mt-0">
            <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide block mb-2">
              Timestamps (HH:MM:SS)
              <Tip text="Add multiple timestamps to extract specific frames from your video." />
            </Label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {timestampList.map((ts, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    type="text" placeholder="00:00:05"
                    value={ts}
                    onChange={(e) => updateTimestamp(i, e.target.value)}
                    className={`font-mono text-sm bg-zinc-50 border-zinc-200 rounded-xl flex-1 ${
                      ts && !isValidTs(ts) ? "border-red-300 focus-visible:ring-red-200" : ""
                    }`}
                  />
                  {timestampList.length > 1 && (
                    <button
                      onClick={() => removeTimestamp(i)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="outline" size="sm"
              onClick={addTimestamp}
              className="w-full border-dashed border-zinc-300 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 rounded-xl"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Timestamp
            </Button>
          </TabsContent>

          {/* ── Frame Count ── */}
          <TabsContent value="framecount" className="space-y-4 mt-0">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                Total frames to extract
                <Tip text="Frames will be evenly distributed across the video duration." />
              </Label>
              <Input
                type="number" min="1"
                value={frameCount}
                onChange={(e) => setFrameCount(e.target.value)}
                className="font-mono bg-zinc-50 border-zinc-200 rounded-xl"
                placeholder="10"
              />
              {showHighFrameWarning && (
                <p className="text-[11px] text-muted-foreground">
                  Extracting too many frames can make the website unresponsive. Consider increasing the interval.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Start</Label>
                <Input type="text" placeholder="00:00:00" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="font-mono text-sm bg-zinc-50 border-zinc-200 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">End</Label>
                <Input type="text" placeholder="HH:MM:SS" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="font-mono text-sm bg-zinc-50 border-zinc-200 rounded-xl" />
              </div>
            </div>

          </TabsContent>

          {/* ── Smart ── */}
          <TabsContent value="smart" className="space-y-4 mt-0">
            <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 text-xs text-zinc-500 leading-relaxed">
                <span className="font-semibold text-zinc-700">Smart Extract</span> automatically selects the best frames based on your chosen filters. No heavy AI — just focused frame analysis.
            </div>

            {[
              { label: "Avoid blurry frames", sub: "Filters out frames with motion blur or low sharpness", value: avoidBlurry, set: setAvoidBlurry },
              { label: "Prefer bright frames", sub: "Skips frames that are too dark or overexposed", value: preferBright, set: setPreferBright },
              { label: "Detect scene changes", sub: "Extracts a frame at each detected scene cut", value: detectScenes, set: setDetectScenes },
            ].map(({ label, sub, value, set }) => (
              <div key={label} className="flex items-center justify-between gap-3 py-2 border-b border-zinc-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-zinc-800">{label}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{sub}</p>
                </div>
                <Switch checked={value} onCheckedChange={set} />
              </div>
            ))}
          </TabsContent>
        </div>

        {/* ── Output Settings ─────────────────────────────────────────────── */}
        <div className="mt-5 pt-4 border-t border-zinc-100 space-y-4">
          {/* Format */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Output Format</Label>
            <div className="flex gap-2">
              {(["jpg", "png", "webp"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold uppercase border transition-colors ${
                    format === f
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Frames are extracted at the video&apos;s original resolution and best available quality.
          </p>
        </div>

        {/* ── Live Estimation ─────────────────────────────────────────────── */}
        {estimation && (
          <div className="mt-3 rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3 grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Frames", value: estimation.frames },
              { label: "Est. size", value: estimation.size },
              { label: "Est. time", value: estimation.time },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-zinc-400">{label}</p>
                <p className="text-sm font-semibold text-zinc-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        )}

        {errorMessage && (
          <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
        )}

        {/* ── Extract / Stop buttons ──────────────────────────────────── */}
        <div className={`mt-4 ${isExtracting ? "grid grid-cols-[1fr_auto] gap-2" : ""}`}>
          <Button
            size="lg"
            className="w-full rounded-xl py-5 text-sm font-semibold bg-zinc-900 hover:bg-zinc-700 text-white shadow-sm transition-all duration-200 disabled:opacity-50"
            onClick={handleExtract}
            disabled={isExtracting || isInvalid}
          >
            {isExtracting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extracting…</>
            ) : (
              <><ScanLine className="w-4 h-4 mr-2" /> Start Extraction</>
            )}
          </Button>

          {isExtracting && (
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl py-5 px-4 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
              onClick={() => abortRef.current?.abort()}
              title="Stop extraction"
            >
              <Square className="w-4 h-4" />
            </Button>
          )}
        </div>

        {isExtracting && (
          <div className="mt-3 space-y-1.5">
            <Progress value={extractProgress} className="h-2" />
            <p className="text-xs text-center text-zinc-400">
              {extractProgress < 90 ? "Extracting frames locally…" : "Finalising…"} {extractProgress}%
            </p>
          </div>
        )}
      </Tabs>
    </div>
    </TooltipProvider>
  );
}
