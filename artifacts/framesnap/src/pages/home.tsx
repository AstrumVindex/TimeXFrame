import { useState } from "react";
import { Header } from "@/components/layout-header";
import { VideoUploader } from "@/components/video-uploader";
import { VideoPreview } from "@/components/video-preview";
import { ExtractionPanel } from "@/components/extraction-panel";
import { FrameGallery } from "@/components/frame-gallery";
import type { UploadResponse } from "@workspace/api-client-react";
import { motion } from "framer-motion";

export default function Home() {
  const [session, setSession] = useState<UploadResponse | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [hasExtracted, setHasExtracted] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 relative">
      {/* Background Mesh (Only visible when empty) */}
      {!session && (
        <div className="absolute inset-0 z-0 grid-pattern mask-radial-fade opacity-70 pointer-events-none" />
      )}
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
          
          <AnimatePresence mode="wait" initial={false}>
            {!session ? (
              <motion.section 
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                className="max-w-2xl mx-auto mt-16 md:mt-24"
              >
                <div className="text-center mb-10">
                  <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-6">
                    ✨ The fastest way to extract frames
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6">
                    Extract perfection from motion.
                  </h1>
                  <p className="text-muted-foreground text-lg md:text-xl max-w-[500px] mx-auto">
                    Upload your video to intelligently extract, select, and export high-quality frames in seconds.
                  </p>
                </div>
                <div className="bg-white p-2 rounded-3xl shadow-xl shadow-black/5 ring-1 ring-zinc-200/50">
                  <VideoUploader 
                    onUploadSuccess={setSession} 
                    onFileSelect={setLocalFile} 
                  />
                </div>
              </motion.section>
            ) : (
              <motion.div 
                key="workspace"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12 w-full"
              >
                {/* Configuration Section */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
                  <div className="lg:col-span-7 xl:col-span-8 bg-card rounded-2xl border shadow-sm overflow-hidden h-full flex flex-col">
                    {localFile && <VideoPreview file={localFile} session={session} />}
                  </div>
                  <div className="lg:col-span-5 xl:col-span-4 h-full">
                    <ExtractionPanel session={session} onExtracted={() => setHasExtracted(true)} />
                  </div>
                </section>
                
                {/* Results Section */}
                <section className="pt-8 border-t border-zinc-100">
                  <FrameGallery session={session} hasExtracted={hasExtracted} />
                </section>
              </motion.div>
            )}
          </AnimatePresence>
          
        </main>
      </div>
    </div>
  );
}

// Inline AnimatePresence polyfill since we didn't import it at the top level
import { AnimatePresence as FramerAnimatePresence } from "framer-motion";
const AnimatePresence = FramerAnimatePresence;
