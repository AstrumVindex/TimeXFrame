import { useState } from "react";
import { Link } from "wouter";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BlogFeedItem } from "@/components/blog-feed-item";
import type { FeedPost } from "@/components/blog-feed-item";

// ──── Data layer ──────────────────────────────────────────────────────────────
// Drop new posts into this array — the layout renders them automatically.

/**
 * BlogPost — the only shape you need to fill out when adding a new article.
 * Structurally identical to FeedPost; defined here so the data file stays
 * self-contained without importing from the component.
 */
export interface BlogPost {
  /** URL slug, e.g. "4k-video-stills-guide" */
  slug: string;
  /** Human-readable category label */
  category: string;
  /** Full article title */
  title: string;
  /** 1–3 sentence excerpt shown in the feed (keep ≤ 65 words) */
  description: string;
  /** Human-readable date, e.g. "April 5, 2026" */
  date: string;
  /** Estimated reading time in minutes */
  readingTime: number;
  /** Absolute or relative URL to a 16:9 cover image */
  imageUrl: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-extract-frames-from-video-free-guide",
    category: "Guide",
    title: "How to Extract Frames from Video (Free & Easy Guide)",
    description:
      "Want to extract images from a video without losing quality? Learn the best methods and get perfect results using TimexFrame.",
    date: "April 19, 2026",
    readingTime: 6,
    imageUrl: "/how-to-extract-frames-free-easy-guide.png",
  },
  {
    slug: "best-video-frame-extractor-tools-2026-guide",
    category: "Comparison",
    title: "Best Video Frame Extractor Tools (Free & Online) | 2026 Guide",
    description:
      "Compare the top video frame extractor tools in 2026 and see why TimexFrame is the fastest privacy-first option.",
    date: "April 19, 2026",
    readingTime: 7,
    imageUrl: "/best-video-frame-extractor-tools-2026-guide.png",
  },
  {
    slug: "how-to-extract-frames-without-losing-quality",
    category: "Guide",
    title: "How to Extract Frames Without Losing Quality",
    description:
      "Step-by-step quality-first guide to extract frames from video without compression and keep original clarity.",
    date: "April 19, 2026",
    readingTime: 6,
    imageUrl: "/how-to-extract-frames-without-losing-quality.png",
  },
  {
    slug: "how-to-get-thumbnail-from-video-fast-free",
    category: "Guide",
    title: "How to Get Thumbnail from Video (Fast & Free) | TimexFrame",
    description:
      "Step-by-step guide to extract a perfect thumbnail image from video with better quality and faster workflow.",
    date: "April 19, 2026",
    readingTime: 6,
    imageUrl: "/how-to-get-thumbnail-from-video-fast-free.png",
  },
  {
    slug: "mp4-to-jpg-converter-free-online",
    category: "Guide",
    title: "MP4 to JPG Converter (Free & Online) | TimexFrame",
    description:
      "Convert MP4 to JPG online in a few clicks with fast extraction and clean image output.",
    date: "April 19, 2026",
    readingTime: 6,
    imageUrl: "/mp4-to-jpg-converter-free-online.png",
  },
  {
    slug: "the-edge-of-the-browser-client-side-gpu-processing",
    category: "Engineering",
    title: "The Edge of the Browser: How Client-Side GPU Processing is Revolutionizing Video Tools",
    description:
      "The days of upload-and-wait are over. Learn how TimexFrame uses client-side GPU-assisted decoding with WebAssembly-era browser APIs to deliver local extraction, stronger privacy, and hybrid edge AI workflows.",
    date: "April 13, 2026",
    readingTime: 7,
    imageUrl: "/edge-browser-gpu.png",
  },
  {
    slug: "mastering-the-frame-high-resolution-extraction",
    category: "Deep Dive",
    title: "Mastering the Frame: The Technical Art of High-Resolution Extraction",
    description:
      "Why simple screenshots fail and how professional-grade client-side processing preserves the soul of your 4K footage. Learn GOP reconstruction, blur scoring, color fidelity, and privacy-first extraction workflows.",
    date: "April 12, 2026",
    readingTime: 9,
    imageUrl: "/mastering-frame-high-resolution-extraction.png",
  },
  {
    slug: "4k-video-stills-guide",
    category: "Tutorial",
    title: "4K Video Stills: A Complete Guide to Extracting Crisp Frames",
    description:
      "Going from a 4K timeline to pixel-perfect stills is deceptively nuanced. This guide walks through every setting — resolution, codec, and colour science — that separates a sharp extracted frame from a soft, banded disappointment.",
    date: "April 5, 2026",
    readingTime: 6,
    imageUrl: "https://picsum.photos/seed/4kvideo/800/450",
  },
  {
    slug: "analogue-trends-2026",
    category: "Trend Watch",
    title: "Analogue Aesthetics in 2026: Why Film-Style Stills Are Dominating Feeds",
    description:
      "From grain simulators to LUT-pulled bleach bypasses, the analogue resurgence reshaping visual culture is not slowing down. We unpack why extracted video frames — not DSLRs — have become the go-to source for that lo-fi look.",
    date: "April 8, 2026",
    readingTime: 5,
    imageUrl: "https://picsum.photos/seed/analogue2026/800/450",
  },
  {
    slug: "creative-team-workflows",
    category: "Workflow",
    title: "The Hidden ROI of Frame Extraction in Creative Team Workflows",
    description:
      "Replace video scrubbing marathons with lightweight still-frame review sets that travel easily across Notion pages, Slack threads, and client decks. Here's the repeatable process creative directors are quietly adopting.",
    date: "April 10, 2026",
    readingTime: 4,
    imageUrl: "/Hidden-ROI.png",
  },
  {
    slug: "timestamp-mode-mastery",
    category: "Deep Dive",
    title: "Mastering Timestamp Mode: Exact Frame Pulls for High-Stakes Projects",
    description:
      "Timestamp mode gives you surgical precision over which frame you extract, down to the millisecond. This deep dive covers when to use it, how the timecode maths works, and why it matters for documentary editors and forensic analysts alike.",
    date: "April 12, 2026",
    readingTime: 7,
    imageUrl: "/Mastering-Timestamp.png",
  },
];

// ──── Component ───────────────────────────────────────────────────────────────

/**
 * BlogLayout — two-column feed with sticky sidebar.
 *
 * To add a post: append to `blogPosts` above — nothing else to touch.
 */
export function BlogLayout() {
  const [query, setQuery] = useState("");
  const publishedPosts = blogPosts.filter(
    (post) =>
      post.slug === "how-to-extract-frames-from-video-free-guide" ||
      post.slug === "best-video-frame-extractor-tools-2026-guide" ||
      post.slug === "how-to-extract-frames-without-losing-quality" ||
      post.slug === "how-to-get-thumbnail-from-video-fast-free" ||
      post.slug === "mp4-to-jpg-converter-free-online",
  );

  const filtered: FeedPost[] = publishedPosts.filter((post) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q === "" ||
      post.title.toLowerCase().includes(q) ||
      post.description.toLowerCase().includes(q);
    return matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid gap-12 md:grid-cols-[1fr_280px]">

        {/* ── Column 1: Main Feed ──────────────────────────────────────── */}
        <section aria-label="Blog articles">
          {filtered.length === 0 ? (
            <p className="py-24 text-center text-base text-zinc-500">
              No articles match your search.
            </p>
          ) : (
            filtered.map((post, index) => (
              <BlogFeedItem
                key={post.slug}
                post={post}
                isLast={index === filtered.length - 1}
              />
            ))
          )}
        </section>

        {/* ── Column 2: Sticky Sidebar ─────────────────────────────────── */}
        <aside
          aria-label="Blog sidebar"
          className="order-first space-y-8 md:order-none md:sticky md:top-24 md:h-fit"
        >

          {/* Search */}
          <div>
            <label
              htmlFor="blog-search"
              className="mb-2 block text-sm font-semibold text-zinc-900"
            >
              Search
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                aria-hidden="true"
              />
              <Input
                id="blog-search"
                type="search"
                placeholder="Search articles…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
