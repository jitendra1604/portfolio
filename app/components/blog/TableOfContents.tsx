"use client";

import { useEffect, useRef, useState } from "react";

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
  // Rail fill in px, measured against the stops themselves. It used to be a
  // page-progress fraction, which ran on a different clock from the active
  // stop: the fill could sit past a section the reader had not reached yet.
  const [fill, setFill] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const stopRefs = useRef<(HTMLSpanElement | null)[]>([]);

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
      let currentIndex = 0;
      headings.forEach((heading, index) => {
        if (heading.getBoundingClientRect().top <= marker) currentIndex = index;
      });
      const current = headings[currentIndex];
      setActiveId(current.id);

      // Fill reaches the active stop, then advances toward the next stop in
      // step with how far through the active section the marker line is.
      const list = listRef.current;
      const stopTop = (index: number) => {
        const stop = stopRefs.current[index];
        if (!stop || !list) return 0;
        return stop.getBoundingClientRect().top - list.getBoundingClientRect().top + stop.offsetHeight / 2;
      };
      const next = headings[currentIndex + 1];
      let within = 0;
      if (next) {
        const start = current.getBoundingClientRect().top;
        const end = next.getBoundingClientRect().top;
        within = Math.min(1, Math.max(0, (marker - start) / Math.max(1, end - start)));
      }
      const from = stopTop(currentIndex);
      const to = next ? stopTop(currentIndex + 1) : from;
      setFill(from + (to - from) * within);
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
      <p className="text-[11.5px] uppercase tracking-[0.18em] text-caption">On this page</p>

      <ol ref={listRef} className="relative mt-5">
        {/* The rail and its fill sit behind the stops. */}
        <span
          aria-hidden="true"
          className="absolute bottom-3 left-[5.5px] top-3 w-px bg-line"
        />
        <span
          aria-hidden="true"
          className="absolute left-[5.5px] top-3 w-px bg-accent/70 transition-[height] duration-200 ease-out"
          style={{ height: `${Math.max(0, fill - 12)}px` }}
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
                  ref={(el) => {
                    stopRefs.current[index] = el;
                  }}
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
