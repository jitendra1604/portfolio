import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

// Tags used to lead the card — up to six of them, stacked over two lines,
// outranking the headline they belonged to. Three plus a count is enough to
// say what a post is about; the rest are reachable through the filter.
const MAX_VISIBLE_TAGS = 3;

type PostCardProps = {
  post: BlogPost;
  /** The newest post on the blog index runs full width and is labelled. */
  isLead?: boolean;
};

export default function PostCard({ post, isLead = false }: PostCardProps) {
  const isExternal = post.source === "external";
  const href = isExternal ? post.url ?? "#" : `/blog/${post.slug}`;
  const visibleTags = post.tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagCount = post.tags.length - visibleTags.length;

  return (
    <article className={`card relative flex flex-col ${isLead ? "md:col-span-2" : ""}`}>
      <span className="text-xs uppercase tracking-[0.2em] text-caption tabular-nums">
        {post.date} · {post.readingTime} min read
        {isLead ? <span className="ml-2 text-accent">Latest</span> : null}
      </span>

      <h2 className={`mt-2.5 font-semibold ${isLead ? "text-2xl md:text-3xl" : "text-xl"}`}>
        {isExternal ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            // Stretched link: the whole card is the target, so a reader does
            // not have to hit the headline exactly.
            className="after:absolute after:inset-0 hover:text-accent"
          >
            {post.title} <span className="text-base text-caption">↗ on {post.platform}</span>
          </a>
        ) : (
          <Link href={href} className="after:absolute after:inset-0 hover:text-accent">
            {post.title}
          </Link>
        )}
      </h2>

      <p className={`mt-3 text-body ${isLead ? "max-w-3xl" : ""}`}>{post.description}</p>

      {/* mt-auto so tag rows sit on the same baseline across a row of cards,
          however long the descriptions run. */}
      <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
        {visibleTags.map((tag) => (
          <span key={tag} className="chip">
            {tag}
          </span>
        ))}
        {hiddenTagCount > 0 ? (
          <span className="chip" title={post.tags.slice(MAX_VISIBLE_TAGS).join(", ")}>
            +{hiddenTagCount}
          </span>
        ) : null}
      </div>
    </article>
  );
}
