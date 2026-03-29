import { useState } from "react";
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
    title: "Fast Processing",
    desc: "Powered by FFmpeg on the server side, frames are extracted in seconds regardless of video length.",
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
    desc: "Upload MP4, MOV, or WEBM — the most common video formats are all supported out of the box.",
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
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-3">What you get</p>
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
    desc: "Drag and drop or click to upload any MP4, MOV, or WEBM video up to 100 MB.",
  },
  {
    icon: SlidersHorizontal,
    step: "02",
    title: "Select Frame Options",
    desc: "Choose a specific timestamp or extract frames at a regular interval. Adjust quality as needed.",
  },
  {
    icon: Download,
    step: "03",
    title: "Download Frames Instantly",
    desc: "Browse the gallery, pick your favourites, and download individual frames or a bulk ZIP.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-white border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-3">Simple process</p>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900">
            How to Extract Frames in 3 Steps
          </h2>
          <p className="mt-4 text-lg text-zinc-500 max-w-xl mx-auto">
            No sign-up, no software — just upload and go.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px bg-zinc-100 z-0" />

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
    desc: "Find the perfect thumbnail from your video instantly — no need to screenshot manually.",
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
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-3">Use cases</p>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900">Who Is This Tool For?</h2>
          <p className="mt-4 text-lg text-zinc-500 max-w-xl mx-auto">
            FrameSnap is built for anyone who works with video.
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
    a: "Upload your video, choose either a specific timestamp (hh:mm:ss) or an interval (every X seconds), then click Extract Frames. Your frames appear instantly in the gallery.",
  },
  {
    q: "Is this tool free?",
    a: "Yes — FrameSnap is completely free to use with no account required.",
  },
  {
    q: "What video formats are supported?",
    a: "MP4, MOV, and WEBM formats are supported. Files up to 100 MB can be uploaded.",
  },
  {
    q: "Does frame extraction reduce image quality?",
    a: "No. Frames are extracted directly from the video stream at full resolution, so quality is preserved.",
  },
  {
    q: "Is my video safe and private?",
    a: "Your video is processed securely on the server and automatically deleted within one hour. Nothing is stored permanently.",
  },
  {
    q: "What are Smart Suggestions?",
    a: "FrameSnap automatically analyses each frame for sharpness and brightness. Frames that score well are marked with a ✨ Suggested badge so you can quickly find the best ones.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-zinc-100 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-50 transition-colors"
      >
        <span className="font-medium text-zinc-900 pr-4">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-zinc-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-zinc-500 leading-relaxed border-t border-zinc-100 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

export function FAQSection() {
  return (
    <section id="faq" className="py-24 bg-white border-t border-zinc-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-3">Got questions?</p>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <FAQItem key={faq.q} {...faq} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────────────────────────── */

export function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-zinc-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2 font-bold text-zinc-900">
              <div className="bg-zinc-900 text-white p-1 rounded-md">
                <Frame className="w-4 h-4" />
              </div>
              FrameSnap
            </div>
            <p className="text-xs text-zinc-400">Fast, free video frame extractor tool.</p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-400">
            <a href="#features" className="hover:text-zinc-700 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-zinc-700 transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-zinc-700 transition-colors">FAQ</a>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-zinc-400">© {new Date().getFullYear()} FrameSnap. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
