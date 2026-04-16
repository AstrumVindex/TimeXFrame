import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/layout-header";
import { VideoUploader } from "@/components/video-uploader";
import { VideoPreview } from "@/components/video-preview";
import { ExtractionPanel } from "@/components/extraction-panel";
import { FrameGallery } from "@/components/frame-gallery";
import {
  FeaturesSection,
  HowItWorksSection,
  UseCasesSection,
  FAQSection,
  Footer,
} from "@/components/landing-sections";
import { SeoHead } from "@/components/seo-head";
import type { LocalSession, LocalFrame } from "@/lib/types";

export default function Home() {
  const [session, setSession] = useState<LocalSession | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [hasExtracted, setHasExtracted] = useState(false);
  const [extractionVersion, setExtractionVersion] = useState(0);
  const [extractedFrames, setExtractedFrames] = useState<LocalFrame[]>([]);
  const [shouldScrollToUpload, setShouldScrollToUpload] = useState(false);
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

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      <SeoHead
        title="Free Video Frame Extractor Online"
        description="Extract high-quality frames from MP4, MOV, and WEBM videos online. Use count, interval, or timestamp mode and download clean stills."
        canonicalPath="/"
        keywords={[
          "free video frame extractor",
          "extract frames from video online",
          "video to image converter",
          "thumbnail frame extractor",
        ]}
      />
      <Header
        onExtractClick={scrollToUpload}
        isWorkspace={!!session}
        onNewUpload={handleNewUpload}
      />

      <main>
        <AnimatePresence mode="wait" initial={false}>
          {!session ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* ── Hero + Upload ─────────────────────────────────── */}
              <section
                id="upload"
                className="relative overflow-hidden bg-white border-b border-zinc-100"
              >
                {/* Subtle grid background */}
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right,#f1f1f1 1px,transparent 1px),linear-gradient(to bottom,#f1f1f1 1px,transparent 1px)",
                    backgroundSize: "40px 40px",
                    maskImage:
                      "radial-gradient(ellipse 80% 60% at 50% 0%,black 40%,transparent 100%)",
                  }}
                />

                <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
                  <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm font-medium text-zinc-600 mb-8">
                    ✨ Extract frames locally — free &amp; no sign-up
                  </div>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.1]">
                    Extract perfection<br className="hidden sm:block" /> from motion.
                  </h1>

                  <p className="text-lg md:text-xl text-zinc-500 max-w-xl mx-auto mb-12">
                    Choose a video file to intelligently extract, select, and export
                    high-quality frames.
                  </p>

                  {/* File picker */}
                  <div className="bg-white rounded-3xl shadow-xl shadow-black/5 ring-1 ring-zinc-200 p-2">
                    <VideoUploader
                      onUploadSuccess={setSession}
                      onFileSelect={setLocalFile}
                    />
                  </div>
                </div>
              </section>

              {/* ── Landing Sections ──────────────────────────────── */}
              <FeaturesSection />
              <HowItWorksSection />
              <UseCasesSection />
              <FAQSection />
              <Footer />
            </motion.div>
          ) : (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12"
            >
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
                  </div>
                </div>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
