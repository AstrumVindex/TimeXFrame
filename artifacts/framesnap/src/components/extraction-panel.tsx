import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useExtractFrames, getGetFramesQueryKey } from "@workspace/api-client-react";
import type { UploadResponse } from "@workspace/api-client-react";
import { toast } from "@/hooks/use-toast";
import {
  Settings2, ScanLine, Loader2, Plus, X, Timer, Hash,
  Sparkles, Info, ChevronDown, ChevronUp,
} from "lucide-react";

interface ExtractionPanelProps {
  session: UploadResponse;
  onExtracted: () => void;
}

type Mode = "interval" | "timestamp" | "framecount" | "smart";

// Tooltip helper
function Tip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex ml-1 align-middle cursor-help">
      <Info className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-52 rounded-lg bg-zinc-900 text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 leading-relaxed">
        {text}
      </span>
    </span>
  );
}

// Validate HH:MM:SS
function isValidTs(ts: string) {
  return /^\d{1,2}:\d{2}:\d{2}$/.test(ts.trim());
}

export function ExtractionPanel({ session, onExtracted }: ExtractionPanelProps) {
  const queryClient = useQueryClient();
  const { mutate: extractFrames, isPending } = useExtractFrames();

  const [mode, setMode] = useState<Mode>("interval");

  // Interval mode
  const [interval, setInterval] = useState("5");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Timestamp mode — multiple entries
  const [timestamps, setTimestamps] = useState<string[]>(["00:00:05"]);

  // Frame count mode
  const [frameCount, setFrameCount] = useState("10");

  // Smart mode
  const [avoidBlurry, setAvoidBlurry] = useState(true);
  const [preferBright, setPreferBright] = useState(true);
  const [detectScenes, setDetectScenes] = useState(false);

  // Output settings
  const [quality, setQuality] = useState(90);
  const [format, setFormat] = useState<"jpg" | "png" | "webp">("jpg");

  // Advanced
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [skipFirst, setSkipFirst] = useState("");

  // ── Estimation ──────────────────────────────────────────────────────────────
  const estimation = useMemo(() => {
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
      return { frames, size: `~${(frames * 0.4).toFixed(1)} MB`, time: `~${Math.ceil(frames * 0.2)} sec` };
    }
    if (mode === "timestamp") {
      const valid = timestamps.filter(isValidTs).length;
      return { frames: valid, size: `~${(valid * 0.4).toFixed(1)} MB`, time: `~${valid} sec` };
    }
    if (mode === "framecount") {
      const n = parseInt(frameCount, 10);
      if (isNaN(n) || n <= 0) return null;
      return { frames: n, size: `~${(n * 0.4).toFixed(1)} MB`, time: `~${Math.ceil(n * 0.2)} sec` };
    }
    if (mode === "smart") {
      return { frames: "Auto", size: "Varies", time: `~${Math.ceil(span * 0.3)} sec` };
    }
    return null;
  }, [mode, interval, startTime, endTime, timestamps, frameCount, session.duration]);

  // ── Validate ────────────────────────────────────────────────────────────────
  function validate(): string | null {
    if (mode === "interval") {
      const iv = parseFloat(interval);
      if (isNaN(iv) || iv <= 0) return "Enter a valid interval (seconds).";
      if (startTime && !isValidTs(startTime)) return "Start time must be HH:MM:SS.";
      if (endTime && !isValidTs(endTime)) return "End time must be HH:MM:SS.";
    }
    if (mode === "timestamp") {
      if (!timestamps.length || !timestamps.some(isValidTs)) return "Add at least one valid timestamp (HH:MM:SS).";
    }
    if (mode === "framecount") {
      const n = parseInt(frameCount, 10);
      if (isNaN(n) || n < 1 || n > 200) return "Frame count must be between 1 and 200.";
    }
    return null;
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  function handleExtract() {
    const err = validate();
    if (err) { toast({ title: "Invalid input", description: err, variant: "destructive" }); return; }

    const basePayload = {
      sessionId: session.sessionId,
      mode,
      quality,
      format,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      skipFirstSeconds: skipFirst ? parseFloat(skipFirst) : undefined,
    };

    const modePayload =
      mode === "interval" ? { interval: parseFloat(interval) }
      : mode === "timestamp" ? { timestamps: timestamps.filter(isValidTs), timestamp: timestamps.filter(isValidTs)[0] }
      : mode === "framecount" ? { frameCount: parseInt(frameCount, 10) }
      : { avoidBlurry, preferBright, detectSceneChanges: detectScenes };

    extractFrames(
      { data: { ...basePayload, ...modePayload } as any },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getGetFramesQueryKey({ sessionId: session.sessionId }) });
          toast({ title: "Extraction complete", description: `Extracted ${data.frameCount} frames.` });
          onExtracted();
        },
        onError: () => {
          toast({ title: "Extraction failed", description: "An error occurred. Please try again.", variant: "destructive" });
        },
      }
    );
  }

  // ── Timestamp list helpers ───────────────────────────────────────────────────
  const addTimestamp = () => setTimestamps((p) => p.length < 10 ? [...p, ""] : p);
  const removeTimestamp = (i: number) => setTimestamps((p) => p.filter((_, j) => j !== i));
  const updateTimestamp = (i: number, v: string) =>
    setTimestamps((p) => p.map((t, j) => (j === i ? v : t)));

  const isInvalid = !!validate();

  return (
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

        <div className="flex-1 overflow-y-auto space-y-1">

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
              {timestamps.map((ts, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    type="text" placeholder="00:00:05"
                    value={ts}
                    onChange={(e) => updateTimestamp(i, e.target.value)}
                    className={`font-mono text-sm bg-zinc-50 border-zinc-200 rounded-xl flex-1 ${
                      ts && !isValidTs(ts) ? "border-red-300 focus-visible:ring-red-200" : ""
                    }`}
                  />
                  {timestamps.length > 1 && (
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
                type="number" min="1" max="200"
                value={frameCount}
                onChange={(e) => setFrameCount(e.target.value)}
                className="font-mono bg-zinc-50 border-zinc-200 rounded-xl"
                placeholder="10"
              />
              <p className="text-[11px] text-zinc-400">Max 200 frames. Distributed evenly across the timeline.</p>
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

            {/* Quick presets */}
            <div className="flex flex-wrap gap-1.5">
              {[5, 10, 20, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => setFrameCount(String(n))}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    frameCount === String(n)
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  {n} frames
                </button>
              ))}
            </div>
          </TabsContent>

          {/* ── Smart ── */}
          <TabsContent value="smart" className="space-y-4 mt-0">
            <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 text-xs text-zinc-500 leading-relaxed">
              <span className="font-semibold text-zinc-700">Smart Extract</span> automatically selects the best frames based on your chosen filters. No heavy AI — just fast frame analysis.
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

          {/* Quality (only for jpg/webp) */}
          {format !== "png" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                  Quality
                  <Tip text="Higher quality means larger file sizes." />
                </Label>
                <span className="text-xs font-mono text-zinc-500">{quality}%</span>
              </div>
              <input
                type="range" min="10" max="100" step="5"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-zinc-800 h-1.5 rounded-full"
              />
            </div>
          )}

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Advanced Settings
          </button>

          {showAdvanced && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-150">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                  Skip first N seconds
                  <Tip text="Ignore the first N seconds before extracting any frames." />
                </Label>
                <div className="relative">
                  <Input
                    type="number" min="0" step="1"
                    value={skipFirst}
                    onChange={(e) => setSkipFirst(e.target.value)}
                    className="pr-10 font-mono text-sm bg-zinc-50 border-zinc-200 rounded-xl"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">sec</span>
                </div>
              </div>
            </div>
          )}
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

        {/* ── Extract button ─────────────────────────────────────────────── */}
        <Button
          size="lg"
          className="w-full mt-4 rounded-xl py-5 text-sm font-semibold bg-zinc-900 hover:bg-zinc-700 text-white shadow-sm transition-all duration-200 disabled:opacity-50"
          onClick={handleExtract}
          disabled={isPending || isInvalid}
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…</>
          ) : (
            <><ScanLine className="w-4 h-4 mr-2" /> Start Extraction</>
          )}
        </Button>
      </Tabs>
    </div>
  );
}
