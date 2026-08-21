import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import JsonLd from "../../components/JsonLd";
import ShareButtons from "../../components/ShareButtons";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { siteIdentity, siteUrl } from "@/lib/site";

// New slugs (e.g. a fresh Notion post) render on demand instead of 404ing,
// then get cached — see `revalidate` below.
export const dynamicParams = true;
export const revalidate = 30;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.filter((post) => post.source !== "external").map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  const url = `${siteUrl}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url,
      siteName: "Jeet — Portfolio",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  let renderedContent: React.ReactNode;
  try {
    renderedContent = (await compileMDX({ source: post.content })).content;
  } catch {
    // Notion markdown can occasionally include syntax MDX chokes on
    // (stray braces, raw HTML) — fall back to plain text rather than 500ing.
    renderedContent = <pre className="whitespace-pre-wrap font-sans">{post.content}</pre>;
  }

  const url = `${siteUrl}/blog/${post.slug}`;
  return (
    <article className="bg-background px-6 py-28 text-ink md:py-36">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "BlogPosting", headline: post.title, description: post.description, datePublished: post.date, mainEntityOfPage: url, author: { "@type": "Person", name: siteIdentity.fullName, alternateName: siteIdentity.name }, publisher: { "@type": "Person", name: siteIdentity.fullName, alternateName: siteIdentity.name } },
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
            { "@type": "ListItem", position: 3, name: post.title, item: url },
          ] },
        ],
      }} />
      <div className="prose-portfolio mx-auto max-w-3xl">
        <Link href="/blog" className="text-sm text-caption hover:text-accent">← Back to blog</Link>
        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-caption">{post.tags.join(", ")} · {post.date} · {post.readingTime} min read</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">{post.title}</h1>
        <p className="mt-5 text-xl text-body">{post.description}</p>
        <div className="mt-6">
          <ShareButtons url={url} title={post.title} />
        </div>
        <div className="mt-12 text-body">{renderedContent}</div>
      </div>
    </article>
  );
}
