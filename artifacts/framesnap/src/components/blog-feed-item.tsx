import { Link } from "wouter";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";

// ──── Public interface ────────────────────────────────────────────────────────
export interface FeedPost {
  slug: string;
  category: string;
  title: string;
  description: string;
  date: string;
  readingTime: number;
  imageUrl: string;
}

interface BlogFeedItemProps {
  post: FeedPost;
  isLast?: boolean;
}

/**
 * BlogFeedItem — anti-card document style.
 *
 * No borders, no backgrounds, no shadows.
 * Content sits directly on the page. Typography is the hero.
 *
 * Accessibility: WCAG 2.1 AA
 *   - Semantic <article> with aria-labelledby
 *   - Decorative image is aria-hidden
 *   - Keyboard-navigable links with visible focus rings
 *   - <time> with machine-readable dateTime
 */
export function BlogFeedItem({ post, isLast = false }: BlogFeedItemProps) {
  const href = `/blog/${post.slug}`;

  return (
    <article
      aria-labelledby={`post-title-${post.slug}`}
      className={`group py-12${!isLast ? " border-b border-zinc-100" : ""}`}
    >
      {/* 16:9 cover image */}
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block mb-6">
        <div className="aspect-video overflow-hidden rounded-lg">
          <img
            src={post.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
            width={800}
            height={450}
          />
        </div>
      </Link>

      {/* Metadata row */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
        <span className="font-semibold text-zinc-700">{post.category}</span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          <time dateTime={post.date}>{post.date}</time>
        </span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
          {post.readingTime} min read
        </span>
      </div>

      {/* Title */}
      <h2
        id={`post-title-${post.slug}`}
        className="mb-4 text-3xl font-bold tracking-tight text-zinc-900 leading-tight md:text-4xl"
      >
        <Link
          href={href}
          className="rounded transition-colors hover:text-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
        >
          {post.title}
        </Link>
      </h2>

      {/* Excerpt */}
      <p className="max-w-[65ch] text-base leading-relaxed text-zinc-700">
        {post.description}
      </p>

      <Link
        href={href}
        className="mt-6 inline-flex items-center gap-2 rounded text-sm font-semibold text-zinc-900 transition-colors hover:text-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
      >
        Read article
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </article>
  );
}
