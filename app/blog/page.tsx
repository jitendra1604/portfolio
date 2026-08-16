import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Engineering notes from Jeet.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  return (
    <section className="bg-background px-6 py-28 text-ink md:py-36">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-caption">Writing</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">Engineering notes</h1>
        <p className="mt-5 text-lg text-body">Practical notes on building reliable software.</p>
        <div className="mt-12 grid gap-5">
          {posts.map((post) => (
            <article key={post.slug} className="card">
              <p className="text-xs uppercase tracking-[0.2em] text-caption">{post.tag} · {post.date} · {post.readingTime} min read</p>
              <h2 className="mt-3 text-2xl font-semibold"><Link href={`/blog/${post.slug}`} className="hover:text-accent">{post.title}</Link></h2>
              <p className="mt-3 text-body">{post.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
