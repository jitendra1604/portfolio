"use client";

import { useEffect, useState, type ImgHTMLAttributes } from "react";

/**
 * Body image with a caption and a click-to-enlarge view. Diagrams in these
 * posts are dense; at the prose column's width the labels are hard to read,
 * and there was no way to see them bigger short of opening the file.
 *
 * Markdown puts a lone image inside a <p>, so everything here is inline-level
 * (<span>) — a <figure> in a paragraph is invalid HTML and React would warn.
 */
// Alt text comes from Notion, where it is usually the upload's filename
// ("image", "Gemini Generated Image mjzub6…"). Only show it as a caption when
// it reads like one: a few words, none of them an id-shaped token.
function isCaptionWorthy(alt: string) {
  const words = alt.trim().split(/\s+/);
  if (words.length < 3) return false;
  if (/generated image|screenshot|untitled/i.test(alt)) return false;
  return !words.some((word) => /^[a-z0-9_-]{12,}$/i.test(word) && /\d/.test(word));
}

export default function ZoomImage({ alt = "", src, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [open, setOpen] = useState(false);
  const caption = isCaptionWorthy(alt) ? alt : "";

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <span className="block">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={alt ? `Enlarge image: ${alt}` : "Enlarge image"}
          className="block w-full cursor-zoom-in rounded-xl focus-visible:outline-2 focus-visible:outline-accent"
        >
          <img
            {...props}
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </button>
        {caption ? (
          <span className="mt-2 block text-center text-sm text-caption">{caption}</span>
        ) : null}
      </span>

      {open ? (
        <span
          role="dialog"
          aria-modal="true"
          aria-label={alt || "Enlarged image"}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[80] flex cursor-zoom-out items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            className="max-h-full max-w-full rounded-lg object-contain"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-caption hover:text-ink"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </span>
      ) : null}
    </>
  );
}
