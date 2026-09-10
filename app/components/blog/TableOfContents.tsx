"use client";

import { useEffect, useState } from "react";

export type TocEntry = { id: string; text: string; level: 2 | 3 };

/**
 * Sticky section index, drawn as a progress rail: a line down the left with a
 * stop per section, filling as you read. It answers two questions at once —
 * what's in this post, and how far through it am I — instead of being a list
 * that happens to sit beside the text.
 *
 * Lives inside an aside that only exists from xl up.
 */
export default function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string>(entries[0]?.id ?? "");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (entries.length === 0) return;

    const headings = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const update = () => {
      // Active section: the last heading to cross the top quarter of the
      // viewport — that reads as the section you are actually in.
      const marker = window.innerHeight * 0.25;
      let current = headings[0];
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= marker) current = heading;
      }
      setActiveId(current.id);

      // Progress is measured across the article body, not the whole document,
      // so the rail is full when the writing ends rather than after the
      // footer has scrolled by.
      const article = document.getElementById("top");
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const travelled = window.innerHeight * 0.5 - rect.top;
      setProgress(Math.min(1, Math.max(0, travelled / Math.max(1, rect.height))));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [entries]);

  if (entries.length < 3) return null;

  const activeIndex = Math.max(0, entries.findIndex((entry) => entry.id === activeId));

  return (
    <nav
      aria-label="On this page"
      className="sticky top-24 rounded-xl border border-line bg-surface p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11.5px] uppercase tracking-[0.18em] text-caption">On this page</p>
        <span className="text-[12px] font-medium tabular-nums text-accent">{Math.round(progress * 100)}%</span>
      </div>

      <ol className="relative mt-5">
        {/* The rail and its fill sit behind the stops. */}
        <span
          aria-hidden="true"
          className="absolute bottom-3 left-[5.5px] top-3 w-px bg-line"
        />
        <span
          aria-hidden="true"
          className="absolute left-[5.5px] top-3 w-px origin-top bg-accent/70 transition-transform duration-200 ease-out"
          style={{ height: "calc(100% - 24px)", transform: `scaleY(${progress})` }}
        />

        {entries.map((entry, index) => {
          const isActive = entry.id === activeId;
          const isPassed = index < activeIndex;
          return (
            <li key={entry.id} className="relative">
              <a
                href={`#${entry.id}`}
                aria-current={isActive ? "true" : undefined}
                className={`group flex items-start gap-3.5 py-2 pr-1 text-[14.5px] leading-6 transition-colors ${
                  entry.level === 3 ? "pl-3" : ""
                } ${isActive ? "text-ink" : "text-caption hover:text-ink"}`}
              >
                {/* Stop on the rail: filled once reached, ringed while current. */}
                <span
                  aria-hidden="true"
                  className={`mt-[7px] h-3 w-3 shrink-0 rounded-full border-2 transition-colors ${
                    isActive
                      ? "border-accent bg-surface shadow-[0_0_0_3px_rgba(52,211,153,0.18)]"
                      : isPassed
                        ? "border-accent/70 bg-accent/70"
                        : "border-line-strong bg-surface group-hover:border-caption"
                  }`}
                />
                <span className={`transition-transform duration-150 group-hover:translate-x-0.5 ${isActive ? "font-medium" : ""}`}>
                  {entry.text}
                </span>
              </a>
            </li>
          );
        })}
      </ol>

      <a
        href="#top"
        className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-[11.5px] uppercase tracking-[0.14em] text-caption transition-colors hover:text-accent"
      >
        <span aria-hidden="true">↑</span> Back to top
      </a>
    </nav>
  );
}
