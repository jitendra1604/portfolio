import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import BlogList from "./BlogList";

// Notion + RSS posts are fetched live — re-check every 30s so new posts show
// up without a redeploy, without hitting those APIs on every request.
export const revalidate = 30;

export async function generateMetadata(): Promise<Metadata> {
  const posts = await getAllPosts();
  const keywords = Array.from(new Set(posts.flatMap((post) => post.tags)));
  return {
    title: "Blog",
    description: "Learning in public — code, career, and whatever Jeet's figuring out.",
    alternates: { canonical: "/blog" },
    keywords,
  };
}

export default async function BlogIndexPage() {
  const posts = await getAllPosts();
  return (
    <section className="bg-background px-6 py-28 text-ink md:py-36">
      <div className="mx-auto max-w-3xl">
        <Link href="/#home" className="text-sm text-caption hover:text-accent">← Back to home</Link>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-caption">Writing</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">Blog</h1>
        <p className="mt-5 text-lg text-body">Learning in public — code, career, and whatever I'm figuring out.</p>
        <BlogList posts={posts} />
      </div>
    </section>
  );
}
