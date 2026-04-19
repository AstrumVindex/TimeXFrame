import { useState } from "react";
import { Link } from "wouter";
import {
  Crosshair,
  Zap,
  PackageOpen,
  Sparkles,
  FileVideo,
  Upload,
  SlidersHorizontal,
  Download,
  Youtube,
  Instagram,
  Palette,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Frame,
} from "lucide-react";

/* ─── Features ─────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Crosshair,
    title: "Precise Frame Capture",
    desc: "Extract frames at exact timestamps down to the millisecond — perfect for capturing a specific moment.",
  },
  {
    icon: Zap,
    title: "Local Processing",
    desc: "Powered by in-browser extraction, frames are processed on your device without uploading your file.",
  },
  {
    icon: PackageOpen,
    title: "Bulk Download",
    desc: "Select multiple frames and download them all as a single ZIP file with one click.",
  },
  {
    icon: Sparkles,
    title: "Smart Suggestions",
    desc: "Automatically highlights the sharpest and best-lit frames so you always pick the right one.",
  },
  {
    icon: FileVideo,
    title: "Multiple Formats",
    desc: "Use MP4, MOV, or WEBM files directly from your device — common formats are supported out of the box.",
  },
  {
    icon: SlidersHorizontal,
    title: "Interval Extraction",
    desc: "Extract a frame every N seconds to create a full visual summary of your video at any granularity.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-zinc-50 border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-600 mb-3">What you get</p>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900">
            Powerful Frame Extraction Tools
          </h2>
          <p className="mt-4 text-lg text-zinc-500 max-w-xl mx-auto">
            Everything you need to grab, review, and export frames from any video.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-zinc-900 mb-1.5">{title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ──────────────────────────────────────────────────────────── */

const STEPS = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your Video",
    desc: "Drag and drop or browse to select an MP4, MOV, or WEBM video from your device.",
  },
  {
    icon: SlidersHorizontal,
    step: "02",
    title: "Choose Extraction Method",
    desc: "Select Interval, Timestamp, Count, or Smart Extract based on how you want frames extracted.",
  },
  {
    icon: Zap,
    step: "03",
    title: "Start Extraction",
    desc: "Click extract to process frames locally on your device with no upload required.",
  },
  {
    icon: Crosshair,
    step: "04",
    title: "Preview and Select Frames",
    desc: "Review extracted frames in the gallery and pick the exact moments you want to keep.",
  },
  {
    icon: Download,
    step: "05",
    title: "Download Your Frames",
    desc: "Download a single frame or export selected frames together as a ZIP file.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-white border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-600 mb-3">Simple process</p>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900">
            Extract perfect video frames in a few simple steps
          </h2>
          <p className="mt-4 text-lg text-zinc-500 max-w-3xl mx-auto">
            Upload your video, choose how frames should be extracted, preview results, and download high-quality images - all processed locally on your device.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 relative">
          {/* connector line */}
          <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-px bg-zinc-100 z-0" />

          {STEPS.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 w-20 h-20 rounded-2xl bg-zinc-900 text-white flex flex-col items-center justify-center shadow-md mb-6">
                <span className="text-[10px] font-bold text-zinc-400 tracking-widest mb-0.5">{step}</span>
                <Icon className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-zinc-900 text-lg mb-2">{title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Use Cases ─────────────────────────────────────────────────────────────── */

const USE_CASES = [
  {
    icon: Youtube,
    title: "YouTube Creators",
    desc: "Find the perfect thumbnail from your video without manual screenshots.",
    keywords: "thumbnail extractor, frame from video for YouTube",
  },
  {
    icon: Instagram,
    title: "Instagram Creators",
    desc: "Pull high-quality still images from Reels or videos to use as posts or story covers.",
    keywords: "reel thumbnail, video to photo",
  },
  {
    icon: Palette,
    title: "Designers & Artists",
    desc: "Extract reference frames from footage to use as design assets, mood boards, or inspiration.",
    keywords: "video reference frame, design asset extraction",
  },
  {
    icon: GraduationCap,
    title: "Students & Researchers",
    desc: "Capture frames from lectures, documentaries, or research footage for presentations and reports.",
    keywords: "lecture screenshot, video research tool",
  },
];

export function UseCasesSection() {
  return (
    <section id="use-cases" className="py-24 bg-zinc-50 border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-600 mb-3">Use cases</p>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900">Who Is This Tool For?</h2>
          <p className="mt-4 text-lg text-zinc-500 max-w-xl mx-auto">
            TimexFrame is built for anyone who works with video.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {USE_CASES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex gap-5 bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center">
                <Icon className="w-6 h-6 text-zinc-700" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 mb-1">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ───────────────────────────────────────────────────────────────────── */

const FAQS = [
  {
    q: "How do I extract frames from a video?",
    a: "You can extract frames from video by uploading your video, selecting an extraction method (interval, timestamp, count, or Smart Extract), and clicking Start Extraction. Once processing starts, you can preview and download the frames.",
  },
  {
    q: "Is this video frame extractor free to use?",
    a: "Yes, TimexFrame is completely free to use. You can extract and download frames without any subscription or hidden charges in this video frame extractor online tool.",
  },
  {
    q: "Does this tool upload my video to a server?",
    a: "No. Your video is processed locally in your browser. This means your files never leave your device, ensuring complete privacy and security while you extract frames from video.",
  },
  {
    q: "What video formats are supported?",
    a: "TimexFrame supports popular formats including MP4, MOV, and WEBM. These formats work directly in modern browsers without additional software for video frame extraction.",
  },
  {
    q: "Does frame extraction reduce image quality?",
    a: "No. Frames are extracted at the original video resolution and quality. Unlike screenshots, this extract frames from video workflow preserves sharpness and color accuracy.",
  },
  {
    q: "What is Smart Extract and how does it work?",
    a: "Smart Extract automatically selects the best frames based on clarity and visual quality. It analyzes frames to find sharp and well-lit moments, helping you save time without manual selection in a video frame extractor online workflow.",
  },
];

function FAQItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-zinc-100 rounded-xl overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-50 transition-colors"
      >
        <span className="font-medium text-zinc-900 pr-4">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-zinc-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
        )}
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`px-5 pb-4 pt-3 text-sm text-zinc-500 leading-relaxed border-t border-zinc-100 transition-all duration-300 ease-out ${
              open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
            }`}
          >
            {a}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-white border-t border-zinc-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-600 mb-3">Frequently Asked Questions About Frame Extraction</p>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900">FAQs</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, index) => (
            <FAQItem
              key={faq.q}
              {...faq}
              open={openIndex === index}
              onToggle={() => {
                setOpenIndex((current) => (current === index ? null : index));
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────────────────────────── */

export function Footer() {
  const baseUrl = import.meta.env.BASE_URL || "/";

  return (
    <footer className="border-t border-zinc-100 bg-zinc-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.3fr_1fr_1fr_1fr] items-start">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold text-zinc-900">
              <div className="bg-zinc-900 text-white p-1 rounded-md">
                <Frame className="w-4 h-4" />
              </div>
              TimexFrame
            </div>
            <p className="text-sm text-zinc-500 max-w-xs">
              Free video frame extraction for creators, students, and teams.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-3">Product</h3>
            <nav className="space-y-2 text-sm text-zinc-500">
              <a href={`${baseUrl}#features`} className="block hover:text-zinc-900 transition-colors">Features</a>
              <a href={`${baseUrl}#how-it-works`} className="block hover:text-zinc-900 transition-colors">How It Works</a>
              <a href={`${baseUrl}#faq`} className="block hover:text-zinc-900 transition-colors">FAQ</a>
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-3">Resources</h3>
            <nav className="space-y-2 text-sm text-zinc-500">
              <Link href="/blog" className="block hover:text-zinc-900 transition-colors">Blog</Link>
              <Link href="/about" className="block hover:text-zinc-900 transition-colors">About Us</Link>
              <Link href="/contact" className="block hover:text-zinc-900 transition-colors">Contact</Link>
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-3">Legal</h3>
            <nav className="space-y-2 text-sm text-zinc-500">
              <Link href="/privacy" className="block hover:text-zinc-900 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="block hover:text-zinc-900 transition-colors">Terms of Use</Link>
              <Link href="/cookies" className="block hover:text-zinc-900 transition-colors">Cookie Policy</Link>
              <Link href="/disclaimer" className="block hover:text-zinc-900 transition-colors">Disclaimer</Link>
              <Link href="/dmca" className="block hover:text-zinc-900 transition-colors">DMCA Policy</Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-200 pt-4 text-xs text-zinc-400">
          © {new Date().getFullYear()} TimexFrame. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
