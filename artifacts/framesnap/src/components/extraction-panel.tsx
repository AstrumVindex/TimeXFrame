import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useExtractFrames, getGetFramesQueryKey, ExtractRequestMode } from "@workspace/api-client-react";
import type { UploadResponse } from "@workspace/api-client-react";
import { toast } from "@/hooks/use-toast";
import { Settings2, ScanLine, Loader2 } from "lucide-react";

interface ExtractionPanelProps {
  session: UploadResponse;
  onExtracted: () => void;
}

export function ExtractionPanel({ session, onExtracted }: ExtractionPanelProps) {
  const queryClient = useQueryClient();
  const { mutate: extractFrames, isPending } = useExtractFrames();
  
  const [mode, setMode] = useState<"interval" | "timestamp">("interval");
  const [interval, setIntervalVal] = useState<string>("5");
  const [timestamp, setTimestamp] = useState<string>("00:00:05");
  const [quality, setQuality] = useState<string>("90");

  const handleExtract = () => {
    // Validate inputs
    if (mode === "interval" && (!interval || isNaN(Number(interval)) || Number(interval) <= 0)) {
      toast({ title: "Invalid interval", description: "Please enter a valid positive number in seconds.", variant: "destructive" });
      return;
    }
    if (mode === "timestamp" && !/^\d{2}:\d{2}:\d{2}$/.test(timestamp)) {
      toast({ title: "Invalid timestamp", description: "Please use HH:MM:SS format.", variant: "destructive" });
      return;
    }

    extractFrames(
      {
        data: {
          sessionId: session.sessionId,
          mode: mode as ExtractRequestMode,
          interval: mode === "interval" ? Number(interval) : undefined,
          timestamp: mode === "timestamp" ? timestamp : undefined,
          quality: quality ? Number(quality) : 90
        }
      },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getGetFramesQueryKey({ sessionId: session.sessionId }) });
          toast({
            title: "Extraction complete",
            description: `Successfully extracted ${data.frameCount} frames.`
          });
          onExtracted();
        },
        onError: () => {
          toast({
            title: "Extraction failed",
            description: "An error occurred while extracting frames.",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <div className="bg-card rounded-2xl border shadow-sm p-5 md:p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Settings2 className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Extraction Settings</h3>
      </div>

      <Tabs defaultValue="interval" onValueChange={(v) => setMode(v as any)} className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-zinc-100/80 rounded-xl">
          <TabsTrigger value="interval" className="rounded-lg data-[state=active]:shadow-sm">By Interval</TabsTrigger>
          <TabsTrigger value="timestamp" className="rounded-lg data-[state=active]:shadow-sm">By Timestamp</TabsTrigger>
        </TabsList>
        
        <div className="flex-1">
          <TabsContent value="interval" className="space-y-4 mt-0">
            <div className="space-y-2.5">
              <Label htmlFor="interval" className="text-sm font-medium">Extract a frame every</Label>
              <div className="relative">
                <Input 
                  id="interval" 
                  type="number" 
                  min="1" 
                  value={interval}
                  onChange={(e) => setIntervalVal(e.target.value)}
                  className="pl-4 pr-16 py-6 text-lg rounded-xl bg-zinc-50 border-zinc-200 focus-visible:ring-primary/20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">sec</span>
              </div>
              <p className="text-xs text-muted-foreground">Generates multiple frames over the duration of the video.</p>
            </div>
          </TabsContent>

          <TabsContent value="timestamp" className="space-y-4 mt-0">
            <div className="space-y-2.5">
              <Label htmlFor="timestamp" className="text-sm font-medium">Exact Timestamp</Label>
              <Input 
                id="timestamp" 
                type="text" 
                placeholder="00:00:00"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="pl-4 py-6 text-lg rounded-xl font-mono bg-zinc-50 border-zinc-200 focus-visible:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground">Format: HH:MM:SS. Extracts a single high-quality frame.</p>
            </div>
          </TabsContent>

          <div className="mt-8 space-y-2.5 pt-6 border-t border-zinc-100">
            <div className="flex justify-between items-center">
              <Label htmlFor="quality" className="text-sm font-medium">JPEG Quality</Label>
              <span className="text-sm font-mono text-muted-foreground">{quality}%</span>
            </div>
            <input 
              type="range" 
              id="quality" 
              min="10" 
              max="100" 
              step="5"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="w-full accent-primary"
            />
          </div>
        </div>

        <div className="pt-8 mt-auto">
          <Button 
            size="lg" 
            className="w-full rounded-xl py-6 text-base font-semibold shadow-md shadow-primary/10 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            onClick={handleExtract}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <ScanLine className="w-5 h-5 mr-2" />
                Extract Frames
              </>
            )}
          </Button>
        </div>
      </Tabs>
    </div>
  );
}
