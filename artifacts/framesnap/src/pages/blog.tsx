import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, BookOpen, CalendarDays, Clock3 } from "lucide-react";
import { motion, useScroll } from "framer-motion";
import { Header } from "@/components/layout-header";
import { Footer } from "@/components/landing-sections";
import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/seo-head";
import { BlogLayout } from "@/components/blog-layout";

type BlogPost = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  dateLabel: string;
  publishedAt: string;
  updatedAt: string;
  readTime: string;
  summary: string[];
  sections: Array<{
    heading: string;
    body: string;
    comparisonTable?: {
      title: string;
      headers: string[];
      rows: string[][];
    };
    stepsList?: {
      title: string;
      steps: Array<{
        label: string;
        bullets?: string[];
      }>;
    };
    codeBlock?: {
      language?: string;
      code: string;
    };
  }>;
};

const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://timexframe.app";

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "the-edge-of-the-browser-client-side-gpu-processing",
    category: "Engineering",
    title: "The Edge of the Browser: How Client-Side GPU Processing is Revolutionizing Video Tools",
    excerpt:
      "Upload-first workflows are being replaced as modern browsers leverage local silicon for privacy-first video processing that feels closer to native software.",
    seoTitle: "The Edge of the Browser: How Client-Side GPU Processing is Revolutionizing Video Tools",
    seoDescription:
      "How WebAssembly and hardware-accelerated browser APIs are shifting video decoding to the user device for stronger privacy, local control, and smarter hybrid AI workflows.",
    keywords: [
      "client-side gpu video processing",
      "browser video decoding",
      "webassembly video tools",
      "privacy-first frame extraction",
      "edge ai video analysis",
      "timexframe architecture",
    ],
    dateLabel: "April 13, 2026",
    publishedAt: "2026-04-13",
    updatedAt: "2026-04-13",
    readTime: "7 min read",
    summary: [
      "Modern browser runtimes are replacing upload-first pipelines by pushing heavy decoding work to local hardware.",
      "Local extraction lowers infrastructure overhead and keeps source media private by default.",
      "Hybrid edge workflows combine on-device processing with selective server-side AI analysis for smarter suggestions.",
    ],
    sections: [
      {
        heading: "The Infrastructure Shift",
        body:
          "For years, video manipulation on the web followed a rigid pattern: the user uploaded a file to a central server, a high-powered CPU (usually running FFmpeg) processed the request, and the result was sent back. This was slow, expensive for the developer, and a nightmare for user privacy.\n\nIn 2026, the browser is no longer just a window for viewing content. It is a high-performance engine. By utilizing WebAssembly (Wasm) and hardware-accelerated canvas and media APIs, modern tools are moving the factory directly to the user's RAM.",
      },
      {
        heading: "Tapping into the Silicon",
        body:
          "Most modern smartphones and laptops contain dedicated hardware decoders. When you watch a 4K video, your main CPU is barely working. A specialized media block handles the heavy lifting.\n\nTimexFrame taps into this local power. Instead of taxing a server in a remote data center, it uses your device to seek and capture frames directly in-browser, with better energy efficiency than transmitting large media files across the globe.",
      },
      {
        heading: "The Privacy Paradigm",
        body:
          "The biggest benefit of this shift is security. When extraction happens locally, your source video never leaves your device. In an era of data leaks and aggressive model scraping, client-side processing is a meaningful privacy control that helps protect intellectual property.",
      },
      {
        heading: "The Hybrid Future: AI at the Edge",
        body:
          "The final piece is edge analysis. While your device handles decoding and extraction, backend services can score temporary low-resolution thumbnails for sharpness or scene quality in Smart Mode.\n\nThis hybrid design combines local hardware processing with backend intelligence, producing a workflow that feels like native desktop software while running inside a single browser tab.",
      },
    ],
  },
  {
    slug: "mastering-the-frame-high-resolution-extraction",
    category: "Deep Dive",
    title: "Mastering the Frame: The Technical Art of High-Resolution Extraction",
    excerpt:
      "Why simple screenshots fail and how professional-grade client-side processing preserves the soul of your 4K footage.",
    seoTitle: "Mastering the Frame: The Technical Art of High-Resolution Extraction",
    seoDescription:
      "Why simple screenshots fail and how professional-grade client-side processing preserves the soul of your 4K footage.",
    keywords: [
      "high resolution frame extraction",
      "inter-frame compression",
      "client-side frame extraction",
      "laplacian variance sharpness",
      "video gamma shift",
      "webp extraction workflow",
    ],
    dateLabel: "April 12, 2026",
    publishedAt: "2026-04-12",
    updatedAt: "2026-04-12",
    readTime: "9 min read",
    summary: [
      "Screenshots fail because players render reconstructed, smoothed frames instead of preserving source-level fidelity.",
      "TimexFrame uses client-side GOP-aware decoding and sharpness analysis to find cleaner stills with less manual effort.",
      "Color accuracy, output format strategy, and local-first privacy controls are core to pro extraction workflows.",
    ],
    sections: [
      {
        heading: "The Illusion of the Pause Button",
        body:
          "To the casual observer, a video is simply a fast-moving sequence of photos. It stands to reason, then, that pausing a video and taking a screenshot should yield a perfect photograph. However, anyone who has tried to capture a crisp still from a 4K action shot knows this is rarely the case.\n\nWhen you pause a video in a standard web browser, you aren't looking at a raw image. You are looking at a reconstructed frame rendered by your GPU, often at a lower bitrate than the source file, and frequently subject to smoothing algorithms that blur fine details. To truly extract perfection from motion, we have to go deeper into the architecture of video compression itself.",
      },
      {
        heading: "1. Understanding Inter-frame Compression",
        body:
          "Modern video formats like MP4 (H.264/H.265) and WEBM don't store every frame as a full picture. If they did, a 4K movie would take up terabytes of space. Instead, they use temporal compression.\n\nVideo files are made up of a Group of Pictures (GOP), consisting of three types of frames:\n\nI-Frames (Intra-coded): complete images that act as anchors.\nP-Frames (Predicted): store only changes from previous frames.\nB-Frames (Bi-directional): use both forward and backward references.\n\nWhen you use TimexFrame, the browser pipeline does more than take a screenshot. It decodes and reconstructs frame data with GOP context so that even B-frame moments are rendered with high fidelity from surrounding reference frames.",
      },
      {
        heading: "2. The Battle Against Motion Blur",
        body:
          "One of the biggest hurdles in frame extraction is the shutter speed of the original footage. Even in 4K, if a subject is moving faster than exposure can freeze, you get blur.\n\nThis is where Smart Mode changes the game. Instead of manually scrubbing through 60 frames per second, TimexFrame uses Sharp with Laplacian variance analysis to score edge clarity.\n\nBlurry frames tend to have soft, gradual transitions between pixels. Sharp frames show high-contrast edge transitions. By assigning a mathematical sharpness score to each frame, the system surfaces peak-clarity moments and reduces manual selection work.",
      },
      {
        heading: "3. Color Science and Gamma Shifts",
        body:
          "Professional colorists often notice gamma shifts when converting video into stills. Browsers may interpret video and image color spaces differently, such as Rec.709 versus sRGB, causing washed-out or overly dark exports.\n\nTimexFrame now handles extraction directly in the browser and keeps the pipeline color-aware while exporting. A PNG output is not merely a screenshot; it is a color-conscious representation of your original footage.",
      },
      {
        heading: "4. Why No-Login Matters for Creators",
        body:
          "In modern creative workflows, clarity and control are essential. Many pro tools require subscriptions and account setup before you can even start.\n\nTimexFrame is built on an account-free, local-first model. Files are processed on your device so you can move from upload to export without account friction or remote media storage.",
      },
      {
        heading: "5. Optimizing for the Modern Web: WebP and Beyond",
        body:
          "PNG remains the gold standard for lossless quality, but file size can be heavy. For many users, especially bloggers, UI designers, and social teams, WebP is often the practical winner.\n\nWebP can approach JPG-like size while preserving stronger edge quality and optional transparency. TimexFrame supports direct WebP output so you can produce high-resolution stills that remain fast to load on modern mobile and web surfaces.",
      },
    ],
  },
  {
    slug: "4k-video-stills-guide",
    category: "Tutorial",
    title: "4K Video Stills: A Complete Guide to Extracting Crisp Frames",
    excerpt:
      "Going from a 4K timeline to pixel-perfect stills is deceptively nuanced. This guide walks through every setting—resolution, codec, and colour science—that separates a sharp extracted frame from a soft, banded disappointment.",
    seoTitle: "4K Video Stills: A Complete Guide to Extracting Crisp Frames",
    seoDescription:
      "Going from a 4K timeline to pixel-perfect stills is deceptively nuanced. This guide walks through every setting—resolution, codec, and colour science—that separates a sharp extracted frame from a soft, banded disappointment.",
    keywords: [
      "4K video frame extraction",
      "extract frames from 4K video",
      "high resolution video stills",
      "video frame to image",
      "client-side video extraction",
    ],
    dateLabel: "April 5, 2026",
    publishedAt: "2026-04-05",
    updatedAt: "2026-04-05",
    readTime: "6 min read",
    summary: [
      "Use precise extraction modes, not generic screenshots, to capture the exact frame you need.",
      "Choose output formats intentionally: PNG for maximum detail, JPG for sharing, WEBP for balanced quality and size.",
      "TimexFrame processes frames locally in your browser for stronger privacy and immediate control.",
    ],
    sections: [
      {
        heading: "The 4K Advantage: Why Resolution Isn't Everything",
        body:
          "Extracting frames from 4K video technically gives you an 8.3-megapixel image. However, simply hitting \"screenshot\" on your video player often results in compressed, blurry artifacts. To get professional-grade design assets or mood board inspiration, you need a high-performance utility like TimexFrame that handles decoding and extraction in a dedicated client-side pipeline.",
      },
      {
        heading: "Step 1: Choosing the Right Extraction Mode",
        body:
          "To get the \"perfection from motion\" promised by the 4K format, you need to be precise about which frames you grab. Precise Frame Capture: Don't settle for \"close enough.\" Use tools that allow extraction at exact timestamps down to the millisecond to capture the absolute peak of action or the perfect expression. Smart Suggestions: Manually scrubbing through a 4K file for the sharpest shot is tedious. TimexFrame's Smart Mode automatically highlights the sharpest and best-lit frames, ensuring you always pick a winner without the guesswork. Interval Extraction: If you need a full visual summary of a project, extract a frame every N seconds to create a comprehensive overview of your 4K footage.",
      },
      {
        heading: "Step 2: Optimizing Your Output Settings",
        body:
          "A 4K frame is only as good as the format you save it in. When working in the TimexFrame Extraction Settings panel, consider these advanced options. Output Formats: PNG is the gold standard for crispness because it is lossless, meaning every bit of that 4K detail is preserved without compression artifacts. JPG is best for quick sharing or when file size is a concern; set Quality to 90% or higher to minimize banding in high-resolution gradients. WEBP is a modern middle ground that offers excellent quality at smaller file sizes than PNG.",
      },
      {
        heading: "Step 3: Handling the Workflow Like a Pro",
        body:
          "Processing 4K video can be taxing on local hardware, so workflow discipline matters. Upload & Go: Drag and drop your MP4, MOV, or WEBM file with no sign-up. Local Processing: TimexFrame processes frames in-browser, keeping your source media on your device. Bulk Download: Once you've selected your favorite stills, download them all at once as a single ZIP file with one click.",
      },
      {
        heading: "Privacy First",
        body:
          "When working with high-value 4K assets, security is paramount. TimexFrame follows a local-processing model so your files stay on your device during extraction. No accounts are required, and you keep full control over when and where exported frames are saved.",
      },
    ],
  },
  {
    slug: "how-to-extract-frames",
    category: "Tutorial",
    title: "How to Extract Frames from a Video Without Losing Quality",
    excerpt:
      "Learn a practical way to turn any short clip or full-length video into crisp still frames for thumbnails, references, and design work.",
    seoTitle: "How to Extract Frames from Video Without Losing Quality",
    seoDescription:
      "A practical guide to extracting sharp, high-resolution frames from MP4, MOV, and WEBM videos without blur or unnecessary quality loss.",
    keywords: [
      "extract frames from video",
      "video frame extractor",
      "high quality video stills",
      "frame extraction guide",
    ],
    dateLabel: "March 31, 2026",
    publishedAt: "2026-03-31",
    updatedAt: "2026-03-31",
    readTime: "4 min read",
    summary: [
      "Use the original source file when possible for the sharpest results.",
      "Use count, interval, or timestamp mode based on how precise you need the stills to be.",
      "Compare outputs quickly and keep only the frames that best fit your use case.",
    ],
    sections: [
      {
        heading: "Start with the original video",
        body:
          "For the best results, choose the original MP4, MOV, or WEBM file instead of a re-compressed copy. TimexFrame keeps the source resolution so each extracted frame stays sharp.",
      },
      {
        heading: "Choose the right extraction mode",
        body:
          "Use count mode when you want evenly distributed shots across the timeline, timestamp mode for one exact moment, or interval mode when you need a frame every few seconds.",
      },
      {
        heading: "Review and download only the best frames",
        body:
          "After extraction, compare the gallery results, keep your favourite stills, and download them individually or in bulk. This is ideal for YouTube thumbnails, product shots, or research notes.",
      },
    ],
  },
  {
    slug: "best-video-thumbnail-tips",
    category: "Creator Tips",
    title: "5 Tips for Choosing a Better Video Thumbnail Frame",
    excerpt:
      "A strong thumbnail starts with the right frame. These quick tips help creators pick stills that stand out and stay readable on small screens.",
    seoTitle: "5 Tips for Choosing a Better Video Thumbnail Frame",
    seoDescription:
      "Use these practical thumbnail tips to choose cleaner, sharper video frames that stand out on YouTube and other small-screen platforms.",
    keywords: [
      "video thumbnail tips",
      "best frame for thumbnail",
      "youtube thumbnail frame",
      "creator workflow tips",
    ],
    dateLabel: "March 31, 2026",
    publishedAt: "2026-03-31",
    updatedAt: "2026-03-31",
    readTime: "3 min read",
    summary: [
      "Prioritise readable expressions and clean compositions.",
      "Avoid frames with clutter or motion blur when viewers are scanning fast.",
      "Use extracted previews to compare multiple stills side by side before publishing.",
    ],
    sections: [
      {
        heading: "Look for clear facial expressions",
        body:
          "If a person appears in the video, choose a frame with strong emotion, direct focus, and minimal blur. It usually performs better than a neutral mid-motion shot.",
      },
      {
        heading: "Avoid cluttered frames",
        body:
          "Frames with one clear subject are easier to understand at a glance. Simpler compositions also leave more room for overlay text when needed.",
      },
      {
        heading: "Prioritise sharpness and lighting",
        body:
          "A well-lit frame with crisp detail almost always feels more professional. TimexFrame's extracted previews make it easy to compare options quickly.",
      },
    ],
  },
  {
    slug: "creative-team-workflows",
    category: "Workflow",
    title: "The Hidden ROI of Frame Extraction in Creative Team Workflows",
    excerpt:
      "Stop the video scrubbing marathons. Discover how lightweight still-frame review sets are becoming the secret weapon for creative directors across Notion, Slack, and client decks.",
    seoTitle: "The Hidden ROI of Frame Extraction in Creative Team Workflows",
    seoDescription:
      "Stop the video scrubbing marathons. Discover how lightweight still-frame review sets are becoming the secret weapon for creative directors across Notion, Slack, and client decks.",
    keywords: [
      "video frame extractor",
      "frame extractor from video",
      "video extractor",
      "creative workflow",
      "video frame review sets",
      "client approvals with still frames",
    ],
    dateLabel: "April 10, 2026",
    publishedAt: "2026-04-10",
    updatedAt: "2026-04-10",
    readTime: "4 min read",
    summary: [
      "Heavy video files slow down collaboration in tools like Slack, Notion, and client decks.",
      "Extracted still-frame sets create a lightweight visual map that supports approvals and storyboarding.",
      "Local-first extraction removes upload delays and improves creative team throughput.",
    ],
    sections: [
      {
        heading: "Why Every Creative Team Needs a Video Extractor",
        body:
          "In digital production, teams still waste hours scrubbing through raw footage just to find a single reference point. A professional video frame extractor changes this workflow by turning heavy video files into lightweight, actionable assets.\n\nVideo files are difficult to share in Slack, and even harder to embed cleanly in tools like Notion or Trello without friction. When you extract frames from video, you are creating a visual map of your project, not just taking screenshots. This helps creative directors run clearer approvals, enhance storyboarding with real footage references, and simplify technical documentation with high-quality stills.",
      },
      {
        heading: "The Power of the Frame Extractor",
        body:
          "Not all tools are built for professional workflows. A dependable frame extractor from video should handle high-resolution footage without breaking the browser session.\n\nWith TimexFrame, teams can define precise intervals or frame counts to capture exactly what they need. Whether you are finding a transition moment or selecting the best hero shot for a thumbnail, pulling a video frame at native resolution privately is becoming standard practice.",
      },
      {
        heading: "Efficiency at the Edge",
        body:
          "The real ROI is workflow clarity. A modern video extractor that processes media locally on your device removes the upload wall entirely. Teams can move from footage to decision-ready references in one place.\n\nWith the right video frame extractor, creative teams replace scrubbing marathons with a simpler and more dependable production cycle.",
      },
    ],
  },
  {
    slug: "timestamp-mode-mastery",
    category: "Deep Dive",
    title: "Mastering Timestamp Mode: Exact Frame Pulls for High-Stakes Projects",
    excerpt:
      "Timestamp mode gives you surgical precision over which frame you extract, down to the millisecond. This deep dive covers when to use it, how the timecode maths works, and why it matters for documentary editors and forensic analysts alike.",
    seoTitle: "Mastering Timestamp Mode: Exact Frame Pulls for High-Stakes Projects",
    seoDescription:
      "Timestamp mode gives you surgical precision over which frame you extract, down to the millisecond. This deep dive covers when to use it, how the timecode maths works, and why it matters for documentary editors and forensic analysts alike.",
    keywords: [
      "timestamp mode video extractor",
      "exact frame pulls",
      "video timecode extraction",
      "forensic video frame analysis",
      "documentary frame extraction",
      "native resolution video frames",
    ],
    dateLabel: "April 12, 2026",
    publishedAt: "2026-04-12",
    updatedAt: "2026-04-12",
    readTime: "7 min read",
    summary: [
      "Timestamp Mode is built for workflows where exact frame accuracy matters more than rough seeking.",
      "Hardware-accelerated browser decoding plus canvas capture makes repeatable, native-resolution still extraction possible.",
      "Forensics, sports science, and documentary work benefit from precise, shareable timecode-based reference frames.",
    ],
    sections: [
      {
        heading: "The Science of the Millisecond",
        body:
          "In many creative projects, close enough is fine. But in high-stakes environments such as legal forensics, scientific observation, or frame-accurate documentary editing, accuracy is everything. When you need a video frame from exactly 00:04.179, a standard slider will not cut it. You need a dedicated video frame extractor that speaks the language of timecodes.\n\nMost web-based video tools struggle with precision because they rely on low-fidelity seeking. TimexFrame is different. By using the browser's hardware-accelerated decoding, Timestamp Mode allows you to input exact values and work from a more reliable extraction path.",
      },
      {
        heading: "How the Timecode Maths Works",
        body:
          "Input: You provide the exact moment, such as 14.346 seconds.\n\nSeek: The hidden video engine jumps to the nearest precise hardware-decoded frame context.\n\nCapture: The Canvas API paints that specific frame at native resolution, avoiding the UI-layer artifacts and softness that come from ordinary screenshots.\n\nThe result is a much more dependable path for extracting the exact frame you intended to review or document.",
      },
      {
        heading: "When Precision Is Non-Negotiable",
        body:
          "While a general video extractor is useful for social media and content workflows, Timestamp Mode matters most in professional niches where exactness has real consequences.\n\nForensic Analysis: Identify a license plate, gesture, or face in a narrow slice of time where every millisecond matters.\n\nSports Science: Pull the exact frame of a golf swing, sprint finish, or landing position to analyze form.\n\nDocumentary Archiving: Match a still image precisely to historical production notes or logged archive timecodes.",
      },
      {
        heading: "Why Native Extraction Matters",
        body:
          "Standard screenshots often capture the playback UI or introduce additional compression. When you extract frames from video using a dedicated frame extractor from video, you are pulling the actual pixel data rendered from the stream rather than settling for a lossy screen grab.\n\nAs seen in TimexFrame's updated extraction flow, this method is more stable on constrained devices, especially on mobile, where older upload-heavy workflows are more likely to hang or stall.",
      },
      {
        heading: "Repeatable Accuracy",
        body:
          "The real strength of Timestamp Mode is repeatability. If you share a timestamp with a colleague, they can pull the exact same video frame on their device. That creates a shared point of truth for the team and removes the ambiguity of somewhere around the four-second mark.\n\nFor high-stakes projects, repeatable frame references are not a convenience. They are the workflow.",
      },
    ],
  },
  {
    slug: "analogue-trends-2026",
    category: "Trend Watch",
    title: "Analogue Aesthetics in 2026: Why Film-Style Stills Are Dominating Feeds",
    excerpt:
      "From grain simulators to LUT-pulled bleach bypasses, the analogue resurgence reshaping visual culture is not slowing down. We unpack why extracted video frames — not DSLRs — have become the go-to source for that lo-fi look.",
    seoTitle: "Analogue Aesthetics in 2026: Why Film-Style Stills Are Dominating Feeds",
    seoDescription:
      "Discover why video frame extraction has become the go-to method for achieving the analogue, film-style aesthetic that dominates social feeds in 2026.",
    keywords: [
      "analogue aesthetics 2026",
      "film style video stills",
      "lo-fi frame extraction",
      "cinematic video frames",
      "motion blur photography",
      "video frame to photo",
    ],
    dateLabel: "April 8, 2026",
    publishedAt: "2026-04-08",
    updatedAt: "2026-04-08",
    readTime: "5 min read",
    summary: [
      "Perfection fatigue is driving creators toward the imperfect, hazy, and cinematic aesthetic of analogue film.",
      "Video frames carry kinetic energy and natural motion blur that staged photos can't replicate.",
      "TimexFrame's local-first extraction lets you pull bit-perfect stills from your footage without sacrificing privacy.",
    ],
    sections: [
      {
        heading: "The Death of the \"Perfect\" Photo",
        body:
          "For a decade, the goal of digital photography was clinical perfection: more megapixels, sharper edges, and zero noise. But in 2026, we've reached \"perfection fatigue.\" The modern eye is gravitating toward the imperfect, the hazy, and the cinematic.\n\nThis is where video frame extraction comes in. Unlike a staged photograph, a frame pulled from a moving video carries a specific kind of kinetic energy. It captures a \"micro-moment\" that a shutter-click often misses — a half-smile, a blur of motion, or a candid glance.",
      },
      {
        heading: "Why Frames Feel Like Film",
        body:
          "There is a technical reason why a frame from a 4K video feels more like a 35mm film still than a standard digital photo:\n\nNatural Motion Blur: Videos are typically shot with a 180-degree shutter rule, creating a soft, natural blur that mimics the way the human eye perceives movement.\n\nThe Narrative Context: A still frame is a \"slice\" of a larger story. When you look at an extracted frame, your brain subconsciously fills in the seconds before and after, giving the image a cinematic weight.\n\nThe Texture of Light: Modern video sensors handle dynamic range differently than still sensors. Extracting a frame allows you to capture the \"organic\" roll-off of highlights that defines the analogue aesthetic.",
      },
      {
        heading: "Precision Meets Privacy: The TimexFrame Approach",
        body:
          "In the past, getting a high-quality still from a video meant compromising. You either took a low-res screenshot — losing all the detail — or uploaded your private footage to a clunky server workflow.\n\nAt TimexFrame, we've rebuilt this workflow for the modern creator. By shifting the processing power to your own device, we allow for:\n\nBit-Perfect Extraction: Pulling the raw data from the video stream at its native resolution.\n\nFocused Review Workflow: Browsing through frame candidates to find the right filmic moment.\n\nComplete Privacy: Your video never leaves your browser, ensuring your creative process remains yours alone.",
      },
      {
        heading: "How to Achieve the Look",
        body:
          "To get that dominant \"Analogue Feed\" look, start with a high-bitrate video. Use Smart Extraction to find frames with high sharpness but natural motion. Once extracted, apply a subtle grain overlay and a slight green-magenta split tone.\n\nThe result isn't just a picture; it's a mood.",
      },
    ],
  },
];

const ACTIVE_BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-extract-frames-from-video-free-guide",
    category: "Guide",
    title: "How to Extract Frames from Video (Free & Easy Guide)",
    excerpt:
      "Want to extract images from a video without losing quality? Learn the best methods and get perfect results with TimexFrame.",
    seoTitle: "How to Extract Frames from Video (Free & Easy Guide) | TimexFrame",
    seoDescription:
      "Upload your video, choose interval, timestamp, count, or Smart Extract, then preview and download high-quality frames.",
    keywords: [
      "extract frames from video",
      "video to frames",
      "video frame extractor",
      "video to image converter",
      "export frames from video",
      "mp4 to frames",
      "video to image extractor online",
    ],
    dateLabel: "April 19, 2026",
    publishedAt: "2026-04-19",
    updatedAt: "2026-04-19",
    readTime: "6 min read",
    summary: [
      "A video is made of frames, and extraction converts those into standalone image files.",
      "TimexFrame lets you extract by interval, timestamp, frame count, or Smart Extract.",
      "You can preview results before downloading a single frame or a ZIP bundle.",
    ],
    sections: [
      {
        heading: "What Does \"Extract Frames from Video\" Mean?",
        body:
          "A video is made up of thousands of images (frames). Frame extraction means converting those frames into individual image files like JPG or PNG.\n\nThis is useful for:\n• YouTube thumbnails\n• Blog images\n• Social media posts\n• Video editing",
      },
      {
        heading: "How to Extract Frames from Video (Step-by-Step)",
        body: "Method 1: Use TimexFrame (recommended)",
        stepsList: {
          title: "Steps:",
          steps: [
            { label: "Open the TimexFrame tool" },
            { label: "Upload your video file" },
            {
              label: "Choose extraction method:",
              bullets: [
                "By interval (every X seconds)",
                "By timestamp",
                "By frame count",
                "Smart Extract",
              ],
            },
            { label: "Click Start Extraction" },
            { label: "Preview and download frames instantly" },
          ],
        },
      },
      {
        heading: "Other Methods to Extract Frames",
        body:
          "1) Using VLC Media Player\n• Open video in VLC\n• Pause at frame\n• Click Video -> Take Snapshot\nGood for single images, not ideal for multiple frames.\n\n2) Using FFmpeg (advanced users)\nExtracts one frame per second.\n\n3) Using video editing software\nTools like Premiere Pro and DaVinci Resolve allow frame export with high quality, but usually take more time.",
      },
      {
        heading: "Why Use TimexFrame Instead?",
        body:
          "TimexFrame gives you:\n• 100% free access\n• No watermark\n• No upload (privacy-safe)\n• Browser-based workflow\n• Multiple extraction modes\n• Fast processing",
      },
      {
        heading: "Frame Extraction vs Screenshot",
        body: "",
        comparisonTable: {
          title: "Frame Extraction vs Screenshot",
          headers: ["Feature", "Frame Extraction", "Screenshot"],
          rows: [
            ["Quality", "High", "Medium"],
            ["Accuracy", "Exact frame", "Depends"],
            ["Bulk extraction", "Yes", "No"],
          ],
        },
      },
      {
        heading: "Tips for Best Results",
        body:
          "• Use HD or 4K videos\n• Export in PNG for better quality\n• Choose correct timestamps\n• Use interval mode for sequences",
      },
    ],
  },
  {
    slug: "best-video-frame-extractor-tools-2026-guide",
    category: "Comparison",
    title: "Best Video Frame Extractor Tools (Free & Online) | 2026 Guide",
    excerpt:
      "Compare the top video frame extractor tools in 2026 and see why TimexFrame is the fastest privacy-first option.",
    seoTitle: "Best Video Frame Extractor Tools (Free & Online) | 2026 Guide",
    seoDescription:
      "A practical 2026 comparison of video frame extractor tools including TimexFrame, online converters, VLC, FFmpeg, and editing software.",
    keywords: [
      "best video frame extractor tools",
      "video frame extractor comparison",
      "extract frames from video online",
      "timexframe",
      "vlc frame extraction",
      "ffmpeg extract frames",
    ],
    dateLabel: "April 19, 2026",
    publishedAt: "2026-04-19",
    updatedAt: "2026-04-19",
    readTime: "7 min read",
    summary: [
      "This guide compares five common ways to extract frames from video.",
      "TimexFrame leads for privacy, speed, and modern in-browser workflow.",
      "Use the comparison table to choose the right tool for your use case.",
    ],
    sections: [
      {
        heading: "Top Video Frame Extractor Tools (2026)",
        body:
          "Looking for the best video frame extractor tools to convert videos into images? Whether you want thumbnails, social media content, or precise frame capture, choosing the right tool makes a big difference.\n\nIn this guide, we compare top options, including the fastest and most privacy-friendly choice: TimexFrame.",
      },
      {
        heading: "1) TimexFrame (Best Overall)",
        body:
          "TimexFrame is one of the best modern tools for extracting frames from videos online.\n\nKey features:\n• No upload required (100% private)\n• Extract by timestamp, interval, or frame count\n• Smart Extract feature\n• High-quality output (no compression)\n• Works directly in browser\n\nBest for: Beginners + professionals\nSpeed: Very fast",
      },
      {
        heading: "2) Online Video Converter Tools",
        body:
          "Many websites let you convert video to images.\n\nFeatures:\n• Easy to use\n• No installation\n• Supports multiple formats\n\nLimitations:\n• Upload required (privacy risk)\n• File size limits\n• Slower processing\n\nBest for: Small files",
      },
      {
        heading: "3) VLC Media Player",
        body:
          "A free desktop software for basic frame extraction.\n\nFeatures:\n• Free and lightweight\n• Easy snapshot capture\n\nLimitations:\n• Only one frame at a time\n• No batch extraction\n\nBest for: Quick screenshots",
      },
      {
        heading: "4) FFmpeg (Advanced Tool)",
        body:
          "A powerful command-line tool used by developers.\n\nFeatures:\n• Full control\n• Batch extraction\n• High performance\n\nLimitations:\n• Requires technical knowledge\n• No GUI\n\nBest for: Developers",
      },
      {
        heading: "5) Video Editing Software (Premiere Pro, DaVinci)",
        body:
          "Professional tools for frame export.\n\nFeatures:\n• Precise frame control\n• High-quality export\n\nLimitations:\n• Heavy software\n• Time-consuming\n\nBest for: Editors",
      },
      {
        heading: "Comparison Table",
        body: "",
        comparisonTable: {
          title: "Comparison Table",
          headers: ["Tool", "Ease of Use", "Quality", "Bulk Extraction", "Privacy"],
          rows: [
            ["TimexFrame", "★★★★★", "★★★★★", "Yes", "High"],
            ["Online Tools", "★★★★", "★★★★", "Limited", "Low"],
            ["VLC", "★★★★", "★★★★", "No", "High"],
            ["FFmpeg", "★★", "★★★★★", "Yes", "High"],
            ["Editors", "★★★", "★★★★★", "Limited", "High"],
          ],
        },
      },
      {
        heading: "How to Choose the Best Tool",
        body:
          "Choose based on your needs:\n• For beginners -> Use TimexFrame\n• For speed and privacy -> TimexFrame\n• For developers -> FFmpeg\n• For editing work -> Premiere / DaVinci",
      },
    ],
  },
  {
    slug: "how-to-extract-frames-without-losing-quality",
    category: "Guide",
    title: "How to Extract Frames Without Losing Quality",
    excerpt:
      "Learn the best way to extract crystal-clear frames from video without compression or quality loss.",
    seoTitle: "How to Extract Frames Without Losing Quality | TimexFrame",
    seoDescription:
      "Step-by-step guide to extract high-quality video frames, avoid quality loss, and choose the right export settings.",
    keywords: [
      "extract frames without losing quality",
      "high quality video frame extraction",
      "png vs jpg frame extraction",
      "video frame quality tips",
      "timexframe quality guide",
    ],
    dateLabel: "April 19, 2026",
    publishedAt: "2026-04-19",
    updatedAt: "2026-04-19",
    readTime: "6 min read",
    summary: [
      "Use direct frame extraction instead of screenshots for better quality.",
      "Choose PNG export and exact timestamps for clean results.",
      "Avoid common mistakes like compressed formats and low-quality inputs.",
    ],
    sections: [
      {
        heading: "How to Extract Frames Without Losing Quality",
        body:
          "Use TimexFrame (best method)\n\nTimexFrame extracts frames directly from your video source without modifying or compressing them.",
        stepsList: {
          title: "Steps:",
          steps: [
            { label: "Open TimexFrame" },
            { label: "Upload your video" },
            {
              label: "Select extraction mode:",
              bullets: ["Exact timestamp", "Frame interval", "Frame count"],
            },
            { label: "Choose PNG format (recommended)" },
            { label: "Click Start Extraction" },
            { label: "Download your high-quality frames" },
          ],
        },
      },
      {
        heading: "Why Quality Loss Happens (And How to Avoid It)",
        body:
          "Common causes of quality loss:\n• Taking screenshots instead of extracting frames\n• Using compressed image formats\n• Low-resolution video input\n• Tools that resize or compress images",
      },
      {
        heading: "Best Settings for Maximum Quality",
        body:
          "Follow these tips:\n• Use HD or 4K source video\n• Export in PNG format (lossless)\n• Select exact timestamps for precision\n• Avoid resizing after extraction",
      },
      {
        heading: "PNG vs JPG (Which is Better?)",
        body: "",
        comparisonTable: {
          title: "PNG vs JPG (Which is Better?)",
          headers: ["Format", "Quality", "File Size", "Best For"],
          rows: [
            ["PNG", "★★★★★", "Large", "Maximum quality"],
            ["JPG", "★★★★", "Small", "Web usage"],
          ],
        },
      },
      {
        heading: "Mistakes to Avoid",
        body:
          "• Using screenshots instead of extraction\n• Choosing JPG for high-quality needs\n• Uploading low-quality videos\n• Using tools that compress images",
      },
      {
        heading: "Final Thoughts",
        body:
          "If you want crystal-clear images from your videos, use TimexFrame.\n\nYou'll get:\n• Original resolution\n• No compression\n• Perfect clarity",
      },
    ],
  },
  {
    slug: "how-to-get-thumbnail-from-video-fast-free",
    category: "Guide",
    title: "How to Get Thumbnail from Video (Fast & Free) | TimexFrame",
    excerpt:
      "Learn how to extract a perfect thumbnail image from video quickly with high quality and no editing skills.",
    seoTitle: "How to Get Thumbnail from Video (Fast & Free) | TimexFrame",
    seoDescription:
      "Step-by-step guide to capture high-quality video thumbnails, choose better frames, and avoid common thumbnail mistakes.",
    keywords: [
      "how to get thumbnail from video",
      "video thumbnail extractor",
      "youtube thumbnail from video",
      "thumbnail image from video",
      "timexframe thumbnail guide",
    ],
    dateLabel: "April 19, 2026",
    publishedAt: "2026-04-19",
    updatedAt: "2026-04-19",
    readTime: "6 min read",
    summary: [
      "Understand what a video thumbnail is and why it matters for clicks and engagement.",
      "Follow a simple TimexFrame workflow to capture the exact moment as your thumbnail.",
      "Use the right size, format, and selection tips to get cleaner results.",
    ],
    sections: [
      {
        heading: "What is a Video Thumbnail?",
        body:
          "A thumbnail is a preview image that represents your video.\n\nUsed for:\n• YouTube videos\n• Blog posts\n• Social media previews\n• Video marketing\n\nA good thumbnail can increase:\n• Click-through rate (CTR)\n• Engagement\n• Audience attention",
      },
      {
        heading: "How to Get Thumbnail from Video (Step-by-Step)",
        body:
          "Use TimexFrame (best method)\n\nTimexFrame lets you extract the exact frame you want as a thumbnail.",
        stepsList: {
          title: "Steps:",
          steps: [
            { label: "Open TimexFrame" },
            { label: "Upload your video" },
            { label: "Move to the exact moment (preview timeline)" },
            { label: "Select Extract Frame" },
            { label: "Download the thumbnail image" },
          ],
        },
      },
      {
        heading: "How to Choose the Perfect Thumbnail",
        body:
          "Not every frame makes a good thumbnail. Choose wisely.\n\nBest thumbnail tips:\n• Pick a clear and sharp frame\n• Choose a moment with action or emotion\n• Avoid blurry or dark scenes\n• Use frames with faces or focus objects\n• Ensure good lighting",
      },
      {
        heading: "Best Thumbnail Size & Format",
        body:
          "For best results:\n• Recommended size: 1280 × 720 (HD)\n• Format:\n  • JPG -> smaller size\n  • PNG -> higher quality\n\nFor professional use, PNG is recommended.",
      },
      {
        heading: "Common Mistakes to Avoid",
        body:
          "• Using blurry frames\n• Choosing random timestamps\n• Low-resolution videos\n• Over-editing thumbnails\n• Ignoring lighting and contrast",
      },
      {
        heading: "Final Thoughts",
        body:
          "If you want to quickly get a thumbnail from any video, use TimexFrame.\n\nIt helps you:\n• Capture exact moments\n• Get high-quality images\n• Save time",
      },
    ],
  },
  {
    slug: "mp4-to-jpg-converter-free-online",
    category: "Guide",
    title: "MP4 to JPG Converter (Free & Online) | TimexFrame",
    excerpt:
      "Convert MP4 to JPG online in a few clicks with a fast workflow and high-quality image output.",
    seoTitle: "MP4 to JPG Converter (Free & Online) | TimexFrame",
    seoDescription:
      "Learn how to convert MP4 videos into JPG images, choose better settings, and avoid common quality mistakes.",
    keywords: [
      "mp4 to jpg converter",
      "convert mp4 to jpg online",
      "video to jpg converter",
      "extract jpg from video",
      "mp4 frame to jpg",
    ],
    dateLabel: "April 19, 2026",
    publishedAt: "2026-04-19",
    updatedAt: "2026-04-19",
    readTime: "6 min read",
    summary: [
      "Understand what an MP4 to JPG converter does and where it helps.",
      "Follow a step-by-step TimexFrame process for faster conversion.",
      "Choose JPG or PNG based on quality and size goals.",
    ],
    sections: [
      {
        heading: "What is an MP4 to JPG Converter?",
        body:
          "An MP4 to JPG converter is a tool that extracts frames from an MP4 video and saves them as JPG images. Each image represents a specific moment in the video.",
      },
      {
        heading: "How to Convert MP4 to JPG (Step-by-Step)",
        body:
          "Use TimexFrame (best method)\n\nTimexFrame makes MP4 to JPG conversion simple and fast.",
        stepsList: {
          title: "Steps:",
          steps: [
            { label: "Open TimexFrame" },
            { label: "Upload your MP4 video" },
            {
              label: "Choose extraction method:",
              bullets: [
                "Extract all frames",
                "Extract at specific time",
                "Extract every X seconds",
              ],
            },
            { label: "Select JPG format" },
            { label: "Click Start Extraction" },
            { label: "Download your JPG images" },
          ],
        },
      },
      {
        heading: "Why Convert MP4 to JPG?",
        body:
          "Common use cases:\n• Create thumbnails\n• Add images to blogs\n• Social media posts\n• Design and editing\n• Video analysis",
      },
      {
        heading: "JPG vs PNG (Which Should You Choose?)",
        body: "",
        comparisonTable: {
          title: "JPG vs PNG (Which Should You Choose?)",
          headers: ["Format", "Quality", "File Size", "Best For"],
          rows: [
            ["JPG", "★★★★", "Small", "Web, fast loading"],
            ["PNG", "★★★★★", "Large", "High quality"],
          ],
        },
      },
      {
        heading: "Why Use TimexFrame for MP4 to JPG?",
        body:
          "TimexFrame offers:\n• Free conversion\n• No watermark\n• Fast processing\n• No file upload (privacy safe)\n• Multiple extraction options",
      },
      {
        heading: "Common Mistakes to Avoid",
        body:
          "• Choosing low-quality video input\n• Extracting too many unnecessary frames\n• Using the wrong format for your goal\n• Ignoring image resolution",
      },
      {
        heading: "Final Thoughts",
        body:
          "If you want a simple and fast MP4 to JPG converter, use TimexFrame.\n\nIt helps you convert videos into images, get optimized JPG files, and save time.",
      },
      {
        heading: "Target Keywords Used",
        body:
          "• MP4 to JPG converter\n• convert MP4 to JPG online\n• video to JPG converter\n• extract JPG from video\n• MP4 frame to JPG",
      },
    ],
  },
];

function toSectionId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function getArticleSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription,
    author: {
      "@type": "Organization",
      name: "TimexFrame",
    },
    publisher: {
      "@type": "Organization",
      name: "TimexFrame",
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    keywords: post.keywords.join(", "),
  };
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-semibold text-zinc-600">{post.category}</span>
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {post.dateLabel}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock3 className="h-3.5 w-3.5" />
          {post.readTime}
        </span>
      </div>

      <h2 className="text-xl font-semibold text-zinc-900">{post.title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-500">{post.excerpt}</p>

      <ul className="mt-4 space-y-2 text-sm text-zinc-600">
        {post.summary.slice(0, 2).map((point) => (
          <li key={point} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-900" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/blog/${post.slug}`}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:text-zinc-700"
      >
        Read article
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </article>
  );
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      <SeoHead
        title="TimexFrame Blog: Video Frame Extraction Guides and Tips"
        description="Read practical guides on extracting frames from video, preserving image quality, choosing thumbnail stills, and improving creative workflows."
        canonicalPath="/blog"
        keywords={[
          "video frame extraction blog",
          "video thumbnail guide",
          "extract frames from video tutorial",
          "creator workflow tips",
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "TimexFrame Blog",
          description:
            "Practical articles on video frame extraction, thumbnail selection, and visual workflow improvements.",
          url: `${SITE_URL}/blog`,
          publisher: {
            "@type": "Organization",
            name: "TimexFrame",
          },
        }}
      />

      <Header />

      <main className="bg-white">
        <h1 className="sr-only">Video Frame Extraction Blog</h1>
        {/* Document-style feed with sticky sidebar */}
        <BlogLayout />
      </main>

      <Footer />
    </div>
  );
}

export function BlogPostPage({ slug }: { slug: string }) {
  const post = ACTIVE_BLOG_POSTS.find((entry) => entry.slug === slug);
  const { scrollYProgress } = useScroll();
  const [activeSection, setActiveSection] = useState<string>("");

  const sectionIds = useMemo(() => {
    if (!post) return [];
    return post.sections.map((section) => toSectionId(section.heading));
  }, [post]);

  useEffect(() => {
    if (!sectionIds.length) return;

    setActiveSection(sectionIds[0]);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0.2, 0.4, 0.6, 0.8],
      },
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds, slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
        <SeoHead
          title="Article not found"
          description="The requested TimexFrame blog article could not be found."
          canonicalPath={`/blog/${slug}`}
          noIndex
        />
        <Header />
        <main className="bg-white">
          <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
              <BookOpen className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-3">Article not found</h1>
            <p className="text-zinc-500 mb-6">The blog post you requested does not exist or has been moved.</p>
            <Link href="/blog">
              <Button className="bg-zinc-900 hover:bg-zinc-700 text-white rounded-lg font-semibold">Back to blog</Button>
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedPosts = ACTIVE_BLOG_POSTS.filter((entry) => entry.slug !== slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      <motion.div
        className="fixed left-0 right-0 top-0 z-[60] h-1 origin-left bg-zinc-900"
        style={{ scaleX: scrollYProgress }}
      />

      <SeoHead
        title={post.seoTitle}
        description={post.seoDescription}
        canonicalPath={`/blog/${post.slug}`}
        type="article"
        keywords={post.keywords}
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: `${SITE_URL}/`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blog",
                item: `${SITE_URL}/blog`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: post.title,
                item: `${SITE_URL}/blog/${post.slug}`,
              },
            ],
          },
          getArticleSchema(post),
        ]}
      />

      <Header />

      <main className="bg-white">
        {/* ── Document header ─────────────────────────────────────────────── */}
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 pt-12 pb-0">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
            <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-zinc-900 transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-zinc-600">{post.category}</span>
          </nav>

          {/* Metadata line */}
          <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-xs text-zinc-500">{post.category}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>{post.dateLabel}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readTime}</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 leading-tight mb-6">
            {post.title}
          </h1>

          {/* Lead paragraph */}
          <p className="text-lg leading-relaxed text-zinc-600 border-b border-zinc-100 pb-10">
            {post.seoDescription}
          </p>
        </div>

        {/* ── Article body + ToC ───────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">In this article</p>
              <nav aria-label="Table of contents">
                <ul className="space-y-2 text-sm">
                  {post.sections.map((section) => {
                    const id = toSectionId(section.heading);
                    const isActive = activeSection === id;
                    return (
                      <li key={section.heading}>
                        <a
                          href={`#${id}`}
                          className={[
                            "block rounded px-2 py-1 transition-colors",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900",
                            isActive ? "bg-zinc-100 font-semibold text-zinc-900" : "text-zinc-500 hover:text-zinc-900",
                          ].join(" ")}
                        >
                          {section.heading}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </aside>

          <article className="max-w-screen-md space-y-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
                What you'll learn
              </p>
              <ul className="space-y-3">
                {post.summary.map((point) => (
                  <li key={point} className="flex gap-3 text-base text-zinc-700 leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {post.sections.map((section) => (
              <section key={section.heading}>
                <h2
                  id={toSectionId(section.heading)}
                  className="mb-5 border-l-4 border-primary pl-4 text-2xl font-black tracking-tight text-zinc-900 scroll-mt-24"
                >
                  {section.heading}
                </h2>
                {section.body ? (
                  <p className="whitespace-pre-line text-base leading-relaxed text-zinc-600">
                    {section.body}
                  </p>
                ) : null}
                {section.codeBlock ? (
                  <pre className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                    <code className="text-sm text-zinc-900">{section.codeBlock.code}</code>
                  </pre>
                ) : null}
                {section.comparisonTable ? (
                  <div className="mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-sm">
                    <div className="px-5 py-4 text-xl font-semibold">
                      {section.comparisonTable.title}
                    </div>
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-t border-zinc-200 border-b border-zinc-200">
                          {section.comparisonTable.headers.map((header) => (
                            <th key={header} className="px-5 py-3 font-semibold text-zinc-900">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.comparisonTable.rows.map((row) => (
                          <tr key={row[0]} className="border-b border-zinc-200 last:border-0">
                            {row.map((cell, cellIndex) => (
                              <td key={`${row[0]}-${cellIndex}`} className="px-5 py-3 text-zinc-900">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
                {section.stepsList ? (
                  <div className="mt-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 text-zinc-900">
                    <p className="text-xl font-semibold">{section.stepsList.title}</p>
                    <ol className="mt-4 list-decimal space-y-2 pl-6 text-base leading-relaxed">
                      {section.stepsList.steps.map((step, stepIndex) => (
                        <li key={`${step.label}-${stepIndex}`}>
                          <span>{step.label}</span>
                          {step.bullets ? (
                            <ul className="mt-1 list-disc space-y-1 pl-6">
                              {step.bullets.map((bullet) => (
                                <li key={bullet}>{bullet}</li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
              </section>
            ))}

            <div className="pt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Try it now</p>
              <p className="text-base leading-relaxed text-zinc-600 mb-5 max-w-[55ch]">
                Go back to the homepage and use the upload flow — no sign-up, no install, nothing leaves your device.
              </p>
              <Link href="/">
                <Button className="bg-zinc-900 hover:bg-zinc-700 text-white rounded-lg font-semibold">
                  Open TimexFrame
                </Button>
              </Link>
            </div>
          </article>
        </div>

        {/* ── Related articles ─────────────────────────────────────────────── */}
        {relatedPosts.length > 0 && (
          <div className="max-w-[720px] mx-auto px-4 sm:px-6 pb-20">
            <div className="border-t border-zinc-100 pt-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-8">Related articles</p>
              <div className="space-y-10">
                {relatedPosts.map((relatedPost) => (
                  <div key={relatedPost.slug} className="border-b border-zinc-100 pb-10 last:border-0 last:pb-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                      <span className="font-semibold uppercase tracking-wider text-zinc-500">{relatedPost.category}</span>
                      <span>·</span>
                      <span>{relatedPost.dateLabel}</span>
                      <span>·</span>
                      <span>{relatedPost.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-2">
                      <Link href={`/blog/${relatedPost.slug}`} className="hover:text-zinc-600 transition-colors">
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-600 max-w-[60ch]">{relatedPost.excerpt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
