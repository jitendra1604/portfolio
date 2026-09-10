import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import JsonLd from "../components/JsonLd";
import { siteIdentity, siteUrl } from "@/lib/site";
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
    alternates: {
      canonical: "/blog",
      types: { "application/rss+xml": `${siteUrl}/blog/rss.xml` },
    },
    keywords,
    openGraph: {
      type: "website",
      url: `${siteUrl}/blog`,
      title: "Blog",
      description: "Learning in public — code, career, and whatever Jeet's figuring out.",
    },
  };
}

export default async function BlogIndexPage() {
  const posts = await getAllPosts();
  return (
    <section className="bg-background px-6 pb-24 pt-10 text-ink md:pb-28 md:pt-14">
      {/* The grid wants the room; the intro copy still reads at ~65 characters. */}
      {/* A Blog + ItemList graph is what earns the post list its own rich
          result, rather than eight unrelated pages. */}
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Blog",
            "@id": `${siteUrl}/blog`,
            name: "Blog",
            description: "Learning in public — code, career, and whatever I'm figuring out.",
            url: `${siteUrl}/blog`,
            inLanguage: "en",
            author: {
              "@type": "Person",
              name: siteIdentity.fullName,
              alternateName: siteIdentity.name,
              jobTitle: siteIdentity.jobTitle,
              url: siteUrl,
              sameAs: [siteIdentity.github, siteIdentity.linkedin].filter(Boolean),
            },
          },
          {
            "@type": "ItemList",
            itemListElement: posts.slice(0, 20).map((post, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: post.source === "external" && post.url ? post.url : `${siteUrl}/blog/${post.slug}`,
              name: post.title,
            })),
          },
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
          ] },
        ],
      }} />
      <div className="mx-auto max-w-[1080px]">
        <Link href="/#home" className="text-sm text-caption hover:text-accent">← Back to home</Link>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-caption">Writing</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">Blog</h1>
        <p className="mt-5 max-w-2xl text-lg text-body">Learning in public — code, career, and whatever I&apos;m figuring out.</p>
        <BlogList posts={posts} />
        <p className="mt-10 text-sm text-caption">
          Prefer a reader?{" "}
          <a href="/blog/rss.xml" className="text-accent hover:text-ink">Subscribe via RSS</a>
        </p>
      </div>
    </section>
  );
}
