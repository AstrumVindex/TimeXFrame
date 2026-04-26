import { lazy, Suspense, useEffect, useState } from "react";
import { Header } from "@/components/layout-header";
import { VideoUploader } from "@/components/video-uploader";
import { SeoHead } from "@/components/seo-head";
import type { LocalSession, LocalFrame } from "@/lib/types";

const VideoPreview = lazy(() =>
  import("@/components/video-preview").then((m) => ({ default: m.VideoPreview })),
);
const ExtractionPanel = lazy(() =>
  import("@/components/extraction-panel").then((m) => ({ default: m.ExtractionPanel })),
);
const FrameGallery = lazy(() =>
  import("@/components/frame-gallery").then((m) => ({ default: m.FrameGallery })),
);
const FeaturesSection = lazy(() =>
  import("@/components/landing-sections").then((m) => ({ default: m.FeaturesSection })),
);
const PopularWaysSection = lazy(() =>
  import("@/components/landing-sections").then((m) => ({ default: m.PopularWaysSection })),
);
const HowItWorksSection = lazy(() =>
  import("@/components/landing-sections").then((m) => ({ default: m.HowItWorksSection })),
);
const UseCasesSection = lazy(() =>
  import("@/components/landing-sections").then((m) => ({ default: m.UseCasesSection })),
);
const FAQSection = lazy(() =>
  import("@/components/landing-sections").then((m) => ({ default: m.FAQSection })),
);
const Footer = lazy(() =>
  import("@/components/landing-sections").then((m) => ({ default: m.Footer })),
);

export default function Home() {
  const [session, setSession] = useState<LocalSession | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [hasExtracted, setHasExtracted] = useState(false);
  const [extractionVersion, setExtractionVersion] = useState(0);
  const [extractedFrames, setExtractedFrames] = useState<LocalFrame[]>([]);
  const [shouldScrollToUpload, setShouldScrollToUpload] = useState(false);
  const [showDeferredSections, setShowDeferredSections] = useState(false);
  const [playheadTime, setPlayheadTime] = useState(0);

  const scrollToUpload = () => {
    const el = document.getElementById("upload");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const revokeIfBlobUrl = (url?: string) => {
    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  const handleNewUpload = () => {
    // Revoke blob URLs to free memory
    if (session) revokeIfBlobUrl(session.objectUrl);
    extractedFrames.forEach((f) => revokeIfBlobUrl(f.url));

    // Prevent browser from jumping back to old hash targets (e.g. #faq)
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    setSession(null);
    setLocalFile(null);
    setHasExtracted(false);
    setExtractionVersion(0);
    setExtractedFrames([]);
    setShouldScrollToUpload(true);
  };

  useEffect(() => {
    if (!shouldScrollToUpload || session) return;
    requestAnimationFrame(() => {
      scrollToUpload();
      setShouldScrollToUpload(false);
    });
  }, [shouldScrollToUpload, session]);

  useEffect(() => {
    if (session) return;

    let timeoutId: number | null = null;
    let idleId: number | null = null;
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    const enableDeferredSections = () => setShowDeferredSections(true);
    const schedule = () => {
      if (typeof win.requestIdleCallback === "function") {
        idleId = win.requestIdleCallback(enableDeferredSections, { timeout: 1800 });
      } else {
        timeoutId = window.setTimeout(enableDeferredSections, 1200);
      }
    };

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }

    return () => {
      window.removeEventListener("load", schedule);
      if (idleId !== null && typeof win.cancelIdleCallback === "function") {
        win.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [session]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      <SeoHead
        title="TimexFrame - Video to Frames Converter | Free Video Frame Extractor Online"
        description="TimexFrame helps you get frames from video instantly with a free video to frame image converter. Extract video frames from MP4, MOV, and WEBM using timestamp, interval, or frame-count mode."
        canonicalPath="/"
        keywords={[
          "get frames from video",
          "video to frame image converter",
          "video to frames",
          "video to image converter",
          "video frame extractor",
          "frame extractor from video",
          "extract frames from video",
          "extract video frames",
          "export frames from video",
          "video to image frames",
          "video to image extractor online",
          "mp4 extract frames",
          "mp4 to frames",
        ]}
      />
      <Header
        onExtractClick={scrollToUpload}
        isWorkspace={!!session}
        onNewUpload={handleNewUpload}
      />

      <main>
        {!session ? (
          <div>
              {/* ── Hero + Upload ─────────────────────────────────── */}
              <section
                id="upload"
                className="relative overflow-hidden bg-white border-b border-zinc-100"
              >
                {/* Subtle grid background */}
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none hidden sm:block"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right,#f1f1f1 1px,transparent 1px),linear-gradient(to bottom,#f1f1f1 1px,transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />

                <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 text-center">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.1]">
                    Extract Perfect Frames from Any Video - Instantly
                  </h1>

                  <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto mb-12">
                    Upload your video, pick the best moment, and download high-quality frames. No upload. No login. Everything runs on your device.
                  </p>

                  {/* File picker */}
                  <div className="bg-white rounded-3xl shadow-xl shadow-black/5 ring-1 ring-zinc-200 p-2">
                    <VideoUploader
                      onUploadSuccess={setSession}
                      onFileSelect={setLocalFile}
                    />
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700">
                      No upload required - processed locally
                    </span>
                    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700">
                      Supports MP4, MOV, WEBM
                    </span>
                    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700">
                      Free &amp; fast extraction
                    </span>
                  </div>
                </div>
              </section>

              {/* ── Landing Sections ──────────────────────────────── */}
              {showDeferredSections ? (
                <Suspense fallback={null}>
                  <div className="cv-auto">
                    <FeaturesSection />
                  </div>
                  <div className="cv-auto">
                    <PopularWaysSection />
                  </div>
                  <div className="cv-auto">
                    <HowItWorksSection />
                  </div>
                  <div className="cv-auto">
                    <UseCasesSection />
                  </div>
                  <div className="cv-auto">
                    <FAQSection />
                  </div>
                  <div className="cv-auto">
                    <Footer />
                  </div>
                </Suspense>
              ) : null}
          </div>
        ) : (
          <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-sm text-zinc-500">Loading workspace...</div>}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
              {/* Back / breadcrumb */}
              <button
                onClick={handleNewUpload}
                className="text-sm text-zinc-400 hover:text-zinc-700 transition-colors flex items-center gap-1"
              >
                ← Back to home page
              </button>

              {/* Video player + extraction config */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
                <div className="lg:col-span-7 xl:col-span-8 bg-card rounded-2xl border shadow-sm overflow-hidden flex flex-col">
                  {localFile && (
                    <VideoPreview file={localFile} session={session} onTimeUpdate={setPlayheadTime} />
                  )}
                </div>
                <div className="lg:col-span-5 xl:col-span-4">
                  <ExtractionPanel
                    session={session}
                    playheadTime={playheadTime}
                    onExtracted={(frames) => {
                      // Revoke old frame URLs before replacing them
                      setExtractedFrames((prev) => {
                        prev.forEach((f) => revokeIfBlobUrl(f.url));
                        return frames;
                      });
                      setHasExtracted(true);
                      setExtractionVersion((v) => v + 1);
                    }}
                    onFrameExtracted={(frame) => {
                      // Progressive: append each frame as it's captured
                      setExtractedFrames((prev) => [...prev, frame]);
                      setHasExtracted(true);
                    }}
                  />
                </div>
              </section>

              {/* Frame gallery */}
              <section className="pt-8 border-t border-zinc-100">
                <FrameGallery
                  sessionId={session.sessionId}
                  frames={extractedFrames}
                  hasExtracted={hasExtracted}
                  extractionVersion={extractionVersion}
                  onDeleteFrames={(ids) => {
                    setExtractedFrames((prev) =>
                      prev.filter((f) => !ids.includes(f.id)),
                    );
                  }}
                />
              </section>

              {/* Compact footer in workspace mode */}
              <footer className="border-t border-zinc-100 pt-6">
                <div className="flex flex-col gap-3 text-center md:flex-row md:items-center md:justify-between">
                  <p className="text-xs text-zinc-400">
                    © {new Date().getFullYear()} TimexFrame — Free video frame extractor.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
                    <a href="/blog" className="hover:text-zinc-900 transition-colors">Blog</a>
                    <a href="/about" className="hover:text-zinc-900 transition-colors">About Us</a>
                    <a href="/contact" className="hover:text-zinc-900 transition-colors">Contact</a>
                    <a href="/privacy" className="hover:text-zinc-900 transition-colors">Privacy</a>
                    <a href="/terms" className="hover:text-zinc-900 transition-colors">Terms</a>
                    <a href="/disclaimer" className="hover:text-zinc-900 transition-colors">Disclaimer</a>
                    <a href="/dmca" className="hover:text-zinc-900 transition-colors">DMCA</a>
                  </div>
                </div>
              </footer>
            </div>
          </Suspense>
        )}
      </main>
    </div>
  );
}
