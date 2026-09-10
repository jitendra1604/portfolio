import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "../../../components/JsonLd";
import PostCard from "../../PostCard";
import { getAllPosts, type BlogPost } from "@/lib/blog";
import { siteIdentity, siteUrl } from "@/lib/site";

export const revalidate = 30;
// Every tag is known at build time from the posts themselves. Leaving
// dynamicParams on meant an unknown tag rendered the not-found page through
// ISR and was served with a 200 — a soft 404, which Google indexes as a thin
// page. Off, an unknown tag is a genuine 404.
export const dynamicParams = false;

/** Tags are display strings ("system-design", "AI CODING") — normalise to a URL. */
export function tagToSlug(tag: string) {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function findTag(slug: string): Promise<{ label: string; posts: BlogPost[] } | null> {
  const posts = await getAllPosts();
  const label = posts.flatMap((post) => post.tags).find((tag) => tagToSlug(tag) === slug);
  if (!label) return null;
  return {
    label,
    posts: posts.filter((post) => post.tags.some((tag) => tagToSlug(tag) === slug)),
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  const slugs = new Set(posts.flatMap((post) => post.tags).map(tagToSlug));
  return Array.from(slugs).map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  const match = await findTag(tag);
  if (!match) return { title: "Tag not found" };

  const title = `${match.label} — writing`;
  const description = `${match.posts.length} ${
    match.posts.length === 1 ? "post" : "posts"
  } on ${match.label} by ${siteIdentity.fullName}: practical engineering notes from production work.`;

  return {
    title,
    description,
    keywords: [match.label],
    alternates: { canonical: `/blog/tag/${tag}` },
    openGraph: {
      type: "website",
      url: `${siteUrl}/blog/tag/${tag}`,
      title,
      description,
    },
  };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const match = await findTag(tag);
  if (!match) notFound();

  const url = `${siteUrl}/blog/tag/${tag}`;

  return (
    <section className="bg-background px-6 pb-24 pt-10 text-ink md:pb-28 md:pt-14">
      {/* A crawlable page per topic: the tag filter on the index is
          client-side, so none of these groupings existed as URLs before. */}
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CollectionPage",
            "@id": url,
            url,
            name: `${match.label} — writing`,
            inLanguage: "en",
            isPartOf: { "@type": "Blog", "@id": `${siteUrl}/blog` },
          },
          {
            "@type": "ItemList",
            itemListElement: match.posts.map((post, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: post.source === "external" && post.url ? post.url : `${siteUrl}/blog/${post.slug}`,
              name: post.title,
            })),
          },
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
            { "@type": "ListItem", position: 3, name: match.label, item: url },
          ] },
        ],
      }} />

      <div className="mx-auto max-w-[1080px]">
        <Link href="/blog" className="text-sm text-caption hover:text-accent">← All writing</Link>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-caption">Topic</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">{match.label}</h1>
        <p className="mt-5 max-w-2xl text-lg text-body">
          {match.posts.length} {match.posts.length === 1 ? "post" : "posts"} on {match.label}.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {match.posts.map((post) => (
            <PostCard key={`${post.source}-${post.slug}`} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
