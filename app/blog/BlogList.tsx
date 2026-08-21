"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BlogPost } from "@/lib/blog";

type BlogListProps = {
  posts: BlogPost[];
};

export default function BlogList({ posts }: BlogListProps) {
  const tags = useMemo(
    () => Array.from(new Set(posts.flatMap((post) => post.tags))).sort((a, b) => a.localeCompare(b)),
    [posts]
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
    );
  };

  useEffect(() => {
    if (!filterOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFilterOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [filterOpen]);

  const visiblePosts =
    selectedTags.length === 0
      ? posts
      : posts.filter((post) => post.tags.some((tag) => selectedTags.includes(tag)));

  if (tags.length === 0) {
    return <PostList posts={posts} />;
  }

  return (
    <>
      <div className="mt-10 flex flex-wrap items-center gap-2">
        <div ref={filterRef} className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            aria-expanded={filterOpen}
            aria-haspopup="true"
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.15em] transition-colors ${
              selectedTags.length > 0
                ? "border-accent text-accent"
                : "border-line text-caption hover:border-line-strong hover:text-ink"
            }`}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
              <path
                d="M4 5h16M7 12h10M10.5 19h3"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
            Filter
            {selectedTags.length > 0 ? (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-background">
                {selectedTags.length}
              </span>
            ) : null}
          </button>

          {filterOpen ? (
            <div
              role="group"
              aria-label="Filter posts by tag"
              className="absolute left-0 top-[calc(100%+8px)] z-20 w-64 max-h-72 overflow-y-auto rounded-2xl border border-line bg-[#121212] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    aria-pressed={isSelected}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs uppercase tracking-[0.14em] text-caption transition-colors hover:bg-white/[0.05] hover:text-ink"
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
                        isSelected ? "border-accent bg-accent" : "border-line-strong"
                      }`}
                    >
                      {isSelected ? (
                        <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
                          <path
                            d="M5 12.5l4.5 4.5L19 7.5"
                            stroke="#0a0a0a"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : null}
                    </span>
                    {tag}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {selectedTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent/10 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-accent transition-colors hover:bg-accent/20"
          >
            {tag}
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-3 w-3">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        ))}

        {selectedTags.length > 0 ? (
          <button
            type="button"
            onClick={() => setSelectedTags([])}
            className="text-xs uppercase tracking-[0.15em] text-caption underline-offset-4 hover:text-accent hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>
      <div className="mt-8">
        <PostList posts={visiblePosts} />
      </div>
    </>
  );
}

function PostList({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return <p className="mt-2 text-body">No posts match the selected tags.</p>;
  }

  return (
    <div className="grid gap-5">
      {posts.map((post) => {
        const isExternal = post.source === "external";
        const href = isExternal ? post.url ?? "#" : `/blog/${post.slug}`;
        return (
          <article key={`${post.source}-${post.slug}`} className="card">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-line px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-caption"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                {post.date} · {post.readingTime} min read
              </span>
            </div>
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
  );
}
