import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Learning in public — code, career, and whatever Jeet's figuring out.",
  alternates: { canonical: "/blog" },
};

// Notion + RSS posts are fetched live — re-check every 30s so new posts show
// up without a redeploy, without hitting those APIs on every request.
export const revalidate = 30;

export default async function BlogIndexPage() {
  const posts = await getAllPosts();
  return (
    <section className="bg-background px-6 py-28 text-ink md:py-36">
      <div className="mx-auto max-w-3xl">
        <Link href="/#home" className="text-sm text-caption hover:text-accent">← Back to home</Link>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-caption">Writing</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">Blog</h1>
        <p className="mt-5 text-lg text-body">Learning in public — code, career, and whatever I'm figuring out.</p>
        <div className="mt-12 grid gap-5">
          {posts.map((post) => {
            const isExternal = post.source === "external";
            const href = isExternal ? post.url ?? "#" : `/blog/${post.slug}`;
            return (
              <article key={`${post.source}-${post.slug}`} className="card">
                <p className="text-xs uppercase tracking-[0.2em] text-caption">
                  {post.tag} · {post.date} · {post.readingTime} min read
                </p>
                <h2 className="mt-3 text-2xl font-semibold">
                  {isExternal ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                      {post.title} <span className="text-base text-caption">↗ on {post.platform}</span>
                    </a>
                  ) : (
                    <Link href={href} className="hover:text-accent">{post.title}</Link>
                  )}
                </h2>
                <p className="mt-3 text-body">{post.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
