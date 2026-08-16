import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import JsonLd from "../../components/JsonLd";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { siteIdentity, siteUrl } from "@/lib/site";

export function generateStaticParams() {
  return getAllPosts().map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const post = getPostBySlug(slug);
    return post
      ? { title: post.title, description: post.description, alternates: { canonical: `/blog/${post.slug}` } }
      : { title: "Post not found" };
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPostBySlug((await params).slug);
  if (!post) notFound();
  const { content } = await compileMDX({ source: post.content });
  const url = `${siteUrl}/blog/${post.slug}`;
  return (
    <article className="bg-background px-6 py-28 text-ink md:py-36">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.description, datePublished: post.date, mainEntityOfPage: url, author: { "@type": "Person", name: siteIdentity.name }, publisher: { "@type": "Person", name: siteIdentity.name } }} />
      <div className="prose-portfolio mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-caption">{post.tag} · {post.date} · {post.readingTime} min read</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">{post.title}</h1>
        <p className="mt-5 text-xl text-body">{post.description}</p>
        <div className="mt-12 text-body">{content}</div>
      </div>
    </article>
  );
}
