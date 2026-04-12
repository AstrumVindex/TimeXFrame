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
  }>;
};

const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://timexframe.app";

export const BLOG_POSTS: BlogPost[] = [
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
      "TimexFrame uses client-side GOP-aware decoding and sharpness analysis to find cleaner stills faster.",
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
          "One of the biggest hurdles in frame extraction is the shutter speed of the original footage. Even in 4K, if a subject is moving faster than exposure can freeze, you get blur.\n\nThis is where Smart Mode changes the game. Instead of manually scrubbing through 60 frames per second, TimexFrame uses Sharp with Laplacian variance analysis to score edge clarity.\n\nBlurry frames tend to have soft, gradual transitions between pixels. Sharp frames show high-contrast edge transitions. By assigning a mathematical sharpness score to each frame, the system can surface peak-clarity moments in seconds, saving editors and creators hours of manual selection.",
      },
      {
        heading: "3. Color Science and Gamma Shifts",
        body:
          "Professional colorists often notice gamma shifts when converting video into stills. Browsers may interpret video and image color spaces differently, such as Rec.709 versus sRGB, causing washed-out or overly dark exports.\n\nTimexFrame now handles extraction directly in the browser and keeps the pipeline color-aware while exporting. A PNG output is not merely a screenshot; it is a color-conscious representation of your original footage.",
      },
      {
        heading: "4. Why No-Login Matters for Creators",
        body:
          "In modern creative workflows, speed is a feature. Many pro tools require subscriptions and account setup before you can even start.\n\nTimexFrame is built on an account-free, local-first model. Files are processed on your device so you can move from upload to export without account friction or remote media storage.",
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
          "Processing 4K video can be taxing on local hardware, so workflow discipline matters. Upload & Go: Drag and drop your MP4, MOV, or WEBM file to start quickly with no sign-up. Local Extraction Speed: TimexFrame processes frames in-browser so you can preview and export without waiting on server queues. Bulk Download: Once you've selected your favorite stills, download them all at once as a single ZIP file with one click.",
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
        {/* Hero */}
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

        {/* Document-style feed with sticky sidebar */}
        <BlogLayout />
      </main>

      <Footer />
    </div>
  );
}

export function BlogPostPage({ slug }: { slug: string }) {
  const post = BLOG_POSTS.find((entry) => entry.slug === slug);
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

  const relatedPosts = BLOG_POSTS.filter((entry) => entry.slug !== slug).slice(0, 2);

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
                <p className="whitespace-pre-line text-base leading-relaxed text-zinc-600">
                  {section.body}
                </p>
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
