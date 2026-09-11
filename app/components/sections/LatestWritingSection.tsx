import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import PostCard from "../../blog/PostCard";

/**
 * The blog is the most-updated part of the site and the home page never
 * mentioned it. Three newest posts, then a door to the rest.
 *
 * Server component: posts come from Notion/MDX at request time, cached by the
 * page's revalidate window, so this adds no client JS.
 */
export default async function LatestWritingSection() {
  const posts = (await getAllPosts()).slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section id="writing" className="bg-background px-6 py-20 text-ink md:py-28">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-caption">Writing</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              Notes from building things.
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-body">
              Learning in public — architecture, AI-assisted workflows, and the last 20% that makes software production-ready.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex shrink-0 items-center gap-2 text-sm text-accent transition-colors hover:text-ink"
          >
            All posts
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={`${post.source}-${post.slug}`} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
