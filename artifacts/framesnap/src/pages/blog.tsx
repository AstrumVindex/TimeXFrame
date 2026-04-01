import { Link } from "wouter";
import { ArrowRight, BookOpen, CalendarDays, Clock3, Sparkles } from "lucide-react";
import { Header } from "@/components/layout-header";
import { Footer } from "@/components/landing-sections";
import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/seo-head";

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
  }>;
};

const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://timexframe.app";

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-extract-frames",
    category: "Tutorial",
    title: "How to Extract Frames from a Video Without Losing Quality",
    excerpt:
      "Learn the fastest way to turn any short clip or full-length video into crisp still frames for thumbnails, references, and design work.",
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
      "Upload the original source file when possible for the sharpest results.",
      "Use count, interval, or timestamp mode based on how precise you need the stills to be.",
      "Compare outputs quickly and keep only the frames that best fit your use case.",
    ],
    sections: [
      {
        heading: "Start with the original video",
        body:
          "For the best results, upload the original MP4, MOV, or WEBM file instead of a re-compressed copy. TimexFrame keeps the source resolution so each extracted frame stays sharp.",
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
    slug: "frame-extraction-for-teams",
    category: "Workflow",
    title: "Why Fast Frame Extraction Helps Creative Teams Move Faster",
    excerpt:
      "From marketing approvals to classroom presentations, fast frame capture reduces back-and-forth and helps teams make decisions sooner.",
    seoTitle: "Why Fast Frame Extraction Helps Creative Teams Move Faster",
    seoDescription:
      "See how quick frame extraction helps creative, marketing, and education teams share visual references faster and keep decisions moving.",
    keywords: [
      "creative workflow",
      "frame extraction for teams",
      "video stills for marketing",
      "storyboard reference frames",
    ],
    dateLabel: "March 31, 2026",
    publishedAt: "2026-03-31",
    updatedAt: "2026-03-31",
    readTime: "4 min read",
    summary: [
      "Replace repeated video scrubbing with quick still-frame review sets.",
      "Share lightweight references in decks, docs, and team chats.",
      "Keep output quality consistent across creative reviews and approvals.",
    ],
    sections: [
      {
        heading: "Speed up review cycles",
        body:
          "Instead of scrubbing through a video repeatedly, teams can extract a set of representative stills and review them together in minutes.",
      },
      {
        heading: "Create lightweight visual references",
        body:
          "Frames are much easier to share in docs, slides, and chats than large video files. That keeps communication fast and focused.",
      },
      {
        heading: "Keep quality consistent",
        body:
          "When the same tool is used to generate stills from the original source, everyone works from a consistent set of assets without manual screenshots.",
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
  const [featuredPost, ...otherPosts] = BLOG_POSTS;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      <SeoHead
        title="TimexFrame Blog: Video Frame Extraction Guides and Tips"
        description="Read practical guides on extracting frames from video, preserving image quality, choosing thumbnail stills, and speeding up creative workflows."
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
        <section className="border-b border-zinc-100 bg-gradient-to-b from-white via-white to-zinc-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-400 mb-3">Blog</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-5 max-w-4xl">
              SEO-friendly guides for better video frame extraction and sharper thumbnail choices.
            </h1>
            <p className="text-lg text-zinc-500 max-w-3xl leading-relaxed">
              Explore practical articles about extracting high-quality stills, selecting stronger video frames,
              and improving team review workflows without slowing down your homepage experience.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Video frame extraction",
                "Thumbnail selection",
                "High-quality stills",
                "Creative workflow tips",
              ].map((topic) => (
                <span key={topic} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-zinc-50 border-b border-zinc-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <article className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-semibold text-zinc-600">Featured article</span>
                <span>{featuredPost.dateLabel}</span>
                <span>{featuredPost.readTime}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 mb-3">{featuredPost.title}</h2>
              <p className="text-zinc-500 leading-relaxed mb-5">{featuredPost.seoDescription}</p>

              <div className="grid gap-3 sm:grid-cols-2 mb-6">
                {featuredPost.summary.map((point) => (
                  <div key={point} className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                    {point}
                  </div>
                ))}
              </div>

              <Link href={`/blog/${featuredPost.slug}`}>
                <Button className="bg-zinc-900 hover:bg-zinc-700 text-white rounded-lg font-semibold">
                  Read featured guide
                </Button>
              </Link>
            </article>

            <aside className="rounded-3xl border border-zinc-200 bg-zinc-900 p-7 text-white shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold mb-3">Built for content-heavy SEO pages</h2>
              <p className="text-sm leading-relaxed text-zinc-300 mb-5">
                Each blog post has its own route, meta title, meta description, and canonical URL so search engines
                can index every guide separately.
              </p>
              <ul className="space-y-3 text-sm text-zinc-200">
                <li>• External blog routes for faster homepage loading</li>
                <li>• Dedicated titles and descriptions per article</li>
                <li>• Structured article markup for better discoverability</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="py-16 bg-zinc-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-2">Latest articles</p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">Browse the full TimexFrame blog</h2>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {otherPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export function BlogPostPage({ slug }: { slug: string }) {
  const post = BLOG_POSTS.find((entry) => entry.slug === slug);

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

  const relatedPosts = BLOG_POSTS.filter((entry) => entry.slug !== slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
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
        <section className="border-b border-zinc-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
              <Link href="/" className="hover:text-zinc-900">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-zinc-900">Blog</Link>
              <span>/</span>
              <span className="text-zinc-700">{post.category}</span>
            </nav>

            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-semibold text-zinc-600">{post.category}</span>
              <span>{post.dateLabel}</span>
              <span>{post.readTime}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-5 max-w-4xl">{post.title}</h1>
            <p className="text-lg text-zinc-500 leading-relaxed max-w-3xl">{post.seoDescription}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <p className="text-xs uppercase tracking-widest text-zinc-400 mb-1">Published</p>
                <p className="text-sm font-medium text-zinc-900">{post.dateLabel}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <p className="text-xs uppercase tracking-widest text-zinc-400 mb-1">Reading time</p>
                <p className="text-sm font-medium text-zinc-900">{post.readTime}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <p className="text-xs uppercase tracking-widest text-zinc-400 mb-1">Focus</p>
                <p className="text-sm font-medium text-zinc-900">{post.category}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-zinc-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <article className="space-y-6">
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-zinc-900 mb-3">What you'll learn</h2>
                <ul className="space-y-3 text-sm text-zinc-600">
                  {post.summary.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-900" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {post.sections.map((section) => (
                <article key={section.heading} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <h2 id={toSectionId(section.heading)} className="text-xl font-semibold text-zinc-900 mb-2 scroll-mt-24">
                    {section.heading}
                  </h2>
                  <p className="text-sm leading-relaxed text-zinc-500">{section.body}</p>
                </article>
              ))}

              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-zinc-900 mb-2">Ready to try it?</h2>
                <p className="text-sm leading-relaxed text-zinc-500 mb-4">
                  Go back to the homepage and use the inline upload flow, feature overview, how-it-works guide, and FAQ without leaving the main experience.
                </p>
                <Link href="/">
                  <Button className="bg-zinc-900 hover:bg-zinc-700 text-white rounded-lg font-semibold">
                    Open TimexFrame
                  </Button>
                </Link>
              </div>
            </article>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-3">In this article</h2>
                <ul className="space-y-2 text-sm text-zinc-600">
                  {post.sections.map((section) => (
                    <li key={section.heading}>
                      <a href={`#${toSectionId(section.heading)}`} className="hover:text-zinc-900">
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-3">SEO keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {post.keywords.map((keyword) => (
                    <span key={keyword} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        {relatedPosts.length > 0 && (
          <section className="pb-16 bg-zinc-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-6">Related articles</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard key={relatedPost.slug} post={relatedPost} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
