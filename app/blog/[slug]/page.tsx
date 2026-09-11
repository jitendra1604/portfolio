import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import JsonLd from "../../components/JsonLd";
import ShareButtons from "../../components/ShareButtons";
import ReadingProgress from "../../components/blog/ReadingProgress";
import CodeBlock from "../../components/blog/CodeBlock";
import TableOfContents, { type TocEntry } from "../../components/blog/TableOfContents";
import MobileToc from "../../components/blog/MobileToc";
import BackToTop from "../../components/blog/BackToTop";
import ZoomImage from "../../components/blog/ZoomImage";
import { getAllPosts, getPostBySlug, type BlogPost } from "@/lib/blog";
import { siteIdentity, siteUrl } from "@/lib/site";
import { tagToSlug } from "../tag/[tag]/page";

// New slugs (e.g. a fresh Notion post) render on demand instead of 404ing,
// then get cached — see `revalidate` below.
export const dynamicParams = true;
export const revalidate = 30;

function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function headingText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(headingText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return headingText((children as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

/**
 * Headings carry ids so the table of contents, deep links and Google's
 * "jump to section" links all have something to anchor to.
 */
// Notion to-do items reach MDX as "☐ text" (see humaniseMarkdown). With real
// list markers on every <ul>, they would carry a disc and a box; the box is
// the marker, so the disc goes.
const TASK_MARKER = /^[☐☑]/;

function leadingText(children: ReactNode): string {
  const first = Array.isArray(children) ? children[0] : children;
  return typeof first === "string" ? first : "";
}

// A heading that carries its own link: hover shows a "#" that deep-links to
// the section, so a reader can hand someone one part of a post.
function Heading({ level, children }: { level: 2 | 3; children?: ReactNode }) {
  const id = slugifyHeading(headingText(children));
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <Tag id={id} className="group scroll-mt-28">
      {children}
      <a
        href={`#${id}`}
        aria-label="Link to this section"
        className="ml-2 text-caption opacity-0 transition-opacity hover:text-accent group-hover:opacity-100 focus-visible:opacity-100"
      >
        #
      </a>
    </Tag>
  );
}

// Notion callouts arrive as a blockquote whose first paragraph is led by an
// emoji ("> 💡 Rule of thumb: …"). They read as asides, so draw them as one;
// any other blockquote is a real quote.
const CALLOUT_LEAD = /^\p{Extended_Pictographic}\uFE0F?\s/u;

function firstParagraphLead(children: ReactNode): string {
  const nodes = Array.isArray(children) ? children : [children];
  for (const node of nodes) {
    if (typeof node === "string") {
      if (node.trim() === "") continue;
      return node;
    }
    if (node && typeof node === "object" && "props" in node) {
      return leadingText((node as { props: { children?: ReactNode } }).props.children);
    }
  }
  return "";
}

function Blockquote({ children }: { children?: ReactNode }) {
  const lead = firstParagraphLead(children);
  if (!CALLOUT_LEAD.test(lead)) return <blockquote>{children}</blockquote>;
  const [icon] = lead.match(CALLOUT_LEAD) ?? [""];
  return (
    <aside className="callout">
      <span aria-hidden="true" className="callout-icon">{icon.trim()}</span>
      <div className="callout-body">{children}</div>
    </aside>
  );
}

// Paragraphs inside a callout carry the emoji that Blockquote already drew
// as the icon; drop it from the text.
function Paragraph({ children }: { children?: ReactNode }) {
  const lead = leadingText(children);
  if (!CALLOUT_LEAD.test(lead)) return <p>{children}</p>;
  const [icon] = lead.match(CALLOUT_LEAD) ?? [""];
  const rest = Array.isArray(children) ? children.slice(1) : [];
  return <p data-callout-lead="">{lead.slice(icon.length)}{rest}</p>;
}

// Off-site links open in a new tab and say so; the post stays put.
function BodyLink({ href = "", children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = /^https?:\/\//.test(href) && !href.startsWith(siteUrl);
  if (!external) return <a href={href} {...props}>{children}</a>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
      <span aria-hidden="true" className="ml-0.5 text-[0.8em] text-caption">↗</span>
    </a>
  );
}

const mdxComponents = {
  img: ZoomImage,
  pre: CodeBlock,
  a: BodyLink,
  p: Paragraph,
  blockquote: Blockquote,
  li: ({ children }: { children?: ReactNode }) =>
    TASK_MARKER.test(leadingText(children)) ? (
      <li className="-ml-6 list-none pl-0">{children}</li>
    ) : (
      <li>{children}</li>
    ),
  h2: ({ children }: { children?: ReactNode }) => <Heading level={2}>{children}</Heading>,
  h3: ({ children }: { children?: ReactNode }) => <Heading level={3}>{children}</Heading>,
};

/** Table of contents is read off the markdown, before MDX compiles it. */
function extractToc(markdown: string): TocEntry[] {
  const entries: TocEntry[] = [];
  let insideFence = false;

  for (const line of markdown.split("\n")) {
    if (line.trim().startsWith("```")) {
      insideFence = !insideFence;
      continue;
    }
    if (insideFence) continue;

    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const text = match[2].replace(/[*_`]/g, "").trim();
    const id = slugifyHeading(text);
    if (id) entries.push({ id, text, level: match[1].length === 2 ? 2 : 3 });
  }
  return entries;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** Most-tags-in-common first, so "related" means related. */
function findRelated(post: BlogPost, posts: BlogPost[]): BlogPost[] {
  return posts
    .filter((other) => other.slug !== post.slug && other.source !== "external")
    .map((other) => ({
      post: other,
      shared: other.tags.filter((tag) => post.tags.includes(tag)).length,
    }))
    .filter((entry) => entry.shared > 0)
    .sort((a, b) => b.shared - a.shared || b.post.date.localeCompare(a.post.date))
    .slice(0, 2)
    .map((entry) => entry.post);
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.filter((post) => post.source !== "external").map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  const url = `${siteUrl}/blog/${post.slug}`;
  // A post with its own cover outranks the generated card in a link preview.
  const image = post.cover ?? `${siteUrl}/opengraph-image`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: siteIdentity.fullName, url: siteUrl }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url,
      siteName: "Jeet — Portfolio",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [siteIdentity.fullName],
      tags: post.tags,
      images: [{ url: image, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [image],
      creator: "@jeet",
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const posts = await getAllPosts();
  const internalPosts = posts.filter((entry) => entry.source !== "external");
  const currentIndex = internalPosts.findIndex((entry) => entry.slug === post.slug);
  const newer = currentIndex > 0 ? internalPosts[currentIndex - 1] : undefined;
  const older = currentIndex >= 0 ? internalPosts[currentIndex + 1] : undefined;
  const related = findRelated(post, internalPosts);
  const toc = extractToc(post.content);

  let renderedContent: React.ReactNode;
  try {
    renderedContent = (
      await compileMDX({
        source: post.content,
        components: mdxComponents,
        options: {
          mdxOptions: {
            rehypePlugins: [
              [
                rehypePrettyCode,
                {
                  theme: "github-dark-default",
                  keepBackground: false,
                  defaultLang: "text",
                },
              ],
            ],
          },
        },
      })
    ).content;
  } catch {
    // Notion markdown can occasionally include syntax MDX chokes on
    // (stray braces, raw HTML) — fall back to plain text rather than 500ing.
    renderedContent = <pre className="whitespace-pre-wrap font-sans">{post.content}</pre>;
  }

  const url = `${siteUrl}/blog/${post.slug}`;
  const image = post.cover ?? `${siteUrl}/opengraph-image`;
  const wordCount = post.content.trim().split(/\s+/).length;

  return (
    <article id="top" className="bg-background px-6 pb-24 pt-10 text-ink md:pb-32 md:pt-14">
      <ReadingProgress />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            dateModified: post.updated ?? post.date,
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            url,
            image,
            keywords: post.tags.join(", "),
            articleSection: post.tags[0],
            wordCount,
            timeRequired: `PT${post.readingTime}M`,
            inLanguage: "en",
            author: {
              "@type": "Person",
              name: siteIdentity.fullName,
              alternateName: siteIdentity.name,
              jobTitle: siteIdentity.jobTitle,
              url: siteUrl,
              sameAs: [siteIdentity.github, siteIdentity.linkedin].filter(Boolean),
            },
            publisher: {
              "@type": "Person",
              name: siteIdentity.fullName,
              alternateName: siteIdentity.name,
              url: siteUrl,
            },
          },
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
            { "@type": "ListItem", position: 3, name: post.title, item: url },
          ] },
        ],
      }} />

      {/* The prose column keeps its reading measure at every width — letting
          it fill the grid stretched lines to ~110 characters and left the rail
          stranded against the right edge. The rail sits beside it, and the
          pair is centred as one block. */}
      <div className="mx-auto flex max-w-3xl flex-col gap-12 xl:max-w-[1160px] xl:flex-row xl:gap-14">
        <div className="prose-portfolio w-full min-w-0 xl:max-w-3xl">
          {/* Header. A breadcrumb in place of the bare back-link says where
              the post sits; the byline carries a face; the share row shares
              a line with it instead of hanging below on its own. */}
          <header className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-24 -top-32 h-72 w-72 rounded-full bg-accent/[0.07] blur-3xl"
            />

            <nav aria-label="Breadcrumb" className="relative flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-caption">
              <Link href="/blog" className="transition-colors hover:text-accent">Blog</Link>
              {post.tags[0] ? (
                <>
                  <span aria-hidden="true" className="text-line-strong">/</span>
                  <Link href={`/blog/tag/${tagToSlug(post.tags[0])}`} className="text-accent transition-colors hover:text-ink">
                    {post.tags[0]}
                  </Link>
                </>
              ) : null}
            </nav>

            <h1 className="relative mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              {post.title}
            </h1>
            <p className="relative mt-5 max-w-2xl text-pretty text-xl leading-relaxed text-body">{post.description}</p>

            <div className="relative mt-8 flex flex-col gap-5 border-y border-line py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/profile.png"
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full border border-line object-cover"
                />
                <div className="text-sm leading-tight">
                  <p className="font-medium text-ink">{siteIdentity.fullName}</p>
                  <p className="mt-1 text-caption">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span aria-hidden="true"> · </span>
                    {post.readingTime} min read
                  </p>
                </div>
              </div>
              <ShareButtons url={url} title={post.title} />
            </div>

            {post.tags.length > 1 ? (
              <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2">
                {post.tags.slice(0, 4).map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog/tag/${tagToSlug(tag)}`}
                    className="chip transition-colors hover:border-line-strong hover:text-ink"
                  >
                    {tag}
                  </Link>
                ))}
                {post.tags.length > 4 ? (
                  <span className="chip" title={post.tags.slice(4).join(", ")}>
                    +{post.tags.length - 4}
                  </span>
                ) : null}
              </div>
            ) : null}

            {post.cover ? (
              <figure className="relative mt-10 overflow-hidden rounded-xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.cover}
                  alt={post.title}
                  className="aspect-[21/9] w-full object-cover"
                  referrerPolicy="no-referrer"
                  fetchPriority="high"
                />
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/70 to-transparent" />
              </figure>
            ) : null}
          </header>

          <MobileToc entries={toc} />

          <div className="mt-12 text-body">{renderedContent}</div>

          {post.updated && post.updated.slice(0, 10) !== post.date.slice(0, 10) ? (
            <p className="mt-12 text-sm text-caption">
              Last updated <time dateTime={post.updated}>{formatDate(post.updated)}</time>
            </p>
          ) : null}

          {/* The post used to just stop. Give a reader who got this far the
              obvious next moves before the author card. */}
          <aside className="mt-12 flex flex-col gap-4 rounded-xl border border-accent/30 bg-accent/[0.06] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-ink">Found this useful?</p>
              <p className="mt-1 text-sm text-body">New posts land every couple of weeks — no newsletter, just a feed.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="/blog/rss.xml" className="btn btn-secondary !px-4 !py-2.5 text-[13px]">Subscribe via RSS</a>
              <a href={siteIdentity.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-secondary !px-4 !py-2.5 text-[13px]">Follow on LinkedIn</a>
            </div>
          </aside>

          {/* Author block — a named, credentialed author is what E-E-A-T asks
              for, and it gives the post somewhere to send readers next. */}
          <aside className="mt-12 rounded-xl border border-line bg-surface p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-caption">Written by</p>
            <p className="mt-2 text-lg font-semibold text-ink">{siteIdentity.fullName}</p>
            <p className="mt-2 text-sm text-body">
              {siteIdentity.jobTitle} — React, Next.js, Node.js, AWS.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <Link href="/#contact" className="text-accent hover:text-ink">Get in touch</Link>
              <a href={siteIdentity.github} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-ink">GitHub</a>
              <a href={siteIdentity.linkedin} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-ink">LinkedIn</a>
            </div>
          </aside>

          {related.length > 0 ? (
            <section className="mt-12">
              <h2 className="text-xs uppercase tracking-[0.2em] text-caption">Related reading</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {related.map((entry) => (
                  <Link
                    key={entry.slug}
                    href={`/blog/${entry.slug}`}
                    className="rounded-xl border border-line bg-surface p-5 transition-colors hover:border-line-strong hover:bg-surface-hover"
                  >
                    <span className="text-xs uppercase tracking-[0.15em] text-caption tabular-nums">
                      {entry.readingTime} min read
                    </span>
                    <span className="mt-2 block font-semibold text-ink">{entry.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {newer || older ? (
            <nav className="mt-12 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:justify-between">
              {older ? (
                <Link href={`/blog/${older.slug}`} className="group max-w-xs">
                  <span className="text-xs uppercase tracking-[0.2em] text-caption">← Older</span>
                  <span className="mt-1 block text-ink group-hover:text-accent">{older.title}</span>
                </Link>
              ) : <span />}
              {newer ? (
                <Link href={`/blog/${newer.slug}`} className="group max-w-xs sm:text-right">
                  <span className="text-xs uppercase tracking-[0.2em] text-caption">Newer →</span>
                  <span className="mt-1 block text-ink group-hover:text-accent">{newer.title}</span>
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>

        {/* The aside must stretch to the article's full height — with
            items-start it collapsed to its own content, leaving the sticky nav
            no range to travel, so it scrolled away like a normal block. */}
        <aside className="hidden xl:block xl:w-[280px] xl:shrink-0 xl:pt-14">
          <TableOfContents entries={toc} />
        </aside>
      </div>
      <BackToTop />
    </article>
  );
}
