import { useState } from "react";
import { Link } from "wouter";
import { Search, Zap } from "lucide-react";
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
    slug: "mastering-the-frame-high-resolution-extraction",
    category: "Deep Dive",
    title: "Mastering the Frame: The Technical Art of High-Resolution Extraction",
    description:
      "Why simple screenshots fail and how professional-grade server-side processing preserves the soul of your 4K footage. Learn GOP reconstruction, blur scoring, color fidelity, and privacy-first extraction workflows.",
    date: "April 12, 2026",
    readingTime: 9,
    imageUrl: "https://picsum.photos/seed/masteringframe/800/450",
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
    imageUrl: "https://picsum.photos/seed/teamworkflow/800/450",
  },
  {
    slug: "timestamp-mode-mastery",
    category: "Deep Dive",
    title: "Mastering Timestamp Mode: Exact Frame Pulls for High-Stakes Projects",
    description:
      "Timestamp mode gives you surgical precision over which frame you extract, down to the millisecond. This deep dive covers when to use it, how the timecode maths works, and why it matters for documentary editors and forensic analysts alike.",
    date: "April 12, 2026",
    readingTime: 7,
    imageUrl: "https://picsum.photos/seed/timestamp/800/450",
  },
];

// ──── Derived constants ───────────────────────────────────────────────────────
const UNIQUE_CATEGORIES = Array.from(new Set(blogPosts.map((p) => p.category)));
const ALL_CATEGORIES = ["All", ...UNIQUE_CATEGORIES];

// ──── Component ───────────────────────────────────────────────────────────────

/**
 * BlogLayout — two-column feed with sticky sidebar.
 *
 * To add a post: append to `blogPosts` above — nothing else to touch.
 */
export function BlogLayout() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered: FeedPost[] = blogPosts.filter((post) => {
    const matchesCategory =
      activeCategory === "All" || post.category === activeCategory;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q === "" ||
      post.title.toLowerCase().includes(q) ||
      post.description.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
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
        <aside aria-label="Blog sidebar" className="sticky top-24 h-fit space-y-8">

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

          {/* Category filter */}
          <div>
            <p className="mb-3 text-sm font-semibold text-zinc-900" id="category-filter-label">
              Categories
            </p>
            <ul className="space-y-1" role="list" aria-labelledby="category-filter-label">
              {ALL_CATEGORIES.map((cat) => {
                const count =
                  cat === "All"
                    ? blogPosts.length
                    : blogPosts.filter((p) => p.category === cat).length;
                const isActive = activeCategory === cat;
                return (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      aria-pressed={isActive}
                      className={[
                        "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-1",
                        isActive
                          ? "bg-zinc-900 font-semibold text-white"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                      ].join(" ")}
                    >
                      {cat}
                      <span className="ml-1.5 text-xs text-zinc-400" aria-label={`${count} articles`}>
                        ({count})
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Extract CTA */}
          <div className="rounded-2xl bg-zinc-900 p-5 text-white">
            <h2 className="mb-1.5 text-sm font-semibold">Ready to extract frames?</h2>
            <p className="mb-4 text-xs leading-relaxed text-zinc-400">
              Drop in any MP4, MOV, or WEBM file and get sharp stills in seconds —
              no upload required.
            </p>
            <Link href="/">
              <Button
                size="sm"
                className="w-full bg-white font-semibold text-zinc-900 hover:bg-zinc-100 focus-visible:ring-white"
              >
                <Zap className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Quick Extract
              </Button>
            </Link>
          </div>

        </aside>
      </div>
    </div>
  );
}
