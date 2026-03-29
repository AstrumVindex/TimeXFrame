import { useState } from "react";
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
import type { UploadResponse } from "@workspace/api-client-react";

export default function Home() {
  const [session, setSession] = useState<UploadResponse | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [hasExtracted, setHasExtracted] = useState(false);

  const scrollToUpload = () => {
    const el = document.getElementById("upload");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      <Header onExtractClick={scrollToUpload} />

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
                    ✨ The fastest way to extract frames — free &amp; no sign-up
                  </div>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.1]">
                    Extract perfection<br className="hidden sm:block" /> from motion.
                  </h1>

                  <p className="text-lg md:text-xl text-zinc-500 max-w-xl mx-auto mb-12">
                    Upload your video to intelligently extract, select, and export
                    high-quality frames in seconds.
                  </p>

                  {/* Upload box */}
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
                onClick={() => {
                  setSession(null);
                  setLocalFile(null);
                  setHasExtracted(false);
                }}
                className="text-sm text-zinc-400 hover:text-zinc-700 transition-colors flex items-center gap-1"
              >
                ← Upload a different video
              </button>

              {/* Video player + extraction config */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
                <div className="lg:col-span-7 xl:col-span-8 bg-card rounded-2xl border shadow-sm overflow-hidden flex flex-col">
                  {localFile && (
                    <VideoPreview file={localFile} session={session} />
                  )}
                </div>
                <div className="lg:col-span-5 xl:col-span-4">
                  <ExtractionPanel
                    session={session}
                    onExtracted={() => setHasExtracted(true)}
                  />
                </div>
              </section>

              {/* Frame gallery */}
              <section className="pt-8 border-t border-zinc-100">
                <FrameGallery session={session} hasExtracted={hasExtracted} />
              </section>

              {/* Compact footer in workspace mode */}
              <footer className="border-t border-zinc-100 pt-6 text-center text-xs text-zinc-400">
                © {new Date().getFullYear()} TimexFrame — Fast, free video frame extractor.
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
