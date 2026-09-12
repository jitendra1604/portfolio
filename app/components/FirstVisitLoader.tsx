"use client";

import { useEffect, useState } from "react";

/**
 * Intro loader, shown once per browser session on the first page the visitor
 * lands on. `sessionStorage` is read by the pre-paint script in `layout.tsx`
 * (see FIRST_VISIT_LOADER_SCRIPT below) rather than here, because a `useEffect`
 * check runs after the first paint — returning visitors would see a flash of
 * the full-screen loader before it could be removed.
 */

export const FIRST_VISIT_LOADER_KEY = "jl:intro-seen";

/** Minimum time the mark stays on screen, so it reads as intentional.
 *  Every ms here is added straight to Speed Index for first visits. */
const MIN_VISIBLE_MS = 1100;
/** Must match the --intro-exit duration in globals.css. */
const EXIT_MS = 520;

/**
 * Runs before first paint. Marks <html> only when the intro has not played yet
 * this session, so the loader CSS (which is scoped to that marker) never
 * applies for returning visitors.
 *
 * A `data-` attribute, not a class: React renders `className` on this same
 * <html>, so a class added here before hydration is a guaranteed hydration
 * mismatch. React does not manage `data-intro`, so it hydrates clean.
 */
export const FIRST_VISIT_LOADER_ATTR = "data-intro";

export const INTRO_MARK_SRC = "/brand/jeetlabs-mark-animated.svg";
export const INTRO_WORD_SRC = "/brand/jeetlabs-word.svg";

// When the intro is going to play, its two images are the first paint — and
// the animated mark was the page's LCP element, discovered late because it
// sits inside an <img> deep in the body. Preload them from the same
// pre-paint script, so returning visitors (no intro) pay nothing.
export const FIRST_VISIT_LOADER_SCRIPT = `try{if(!sessionStorage.getItem(${JSON.stringify(
  FIRST_VISIT_LOADER_KEY
)})){document.documentElement.setAttribute(${JSON.stringify(
  FIRST_VISIT_LOADER_ATTR
)},"1");for(var s of [${JSON.stringify(INTRO_MARK_SRC)},${JSON.stringify(
  INTRO_WORD_SRC
)}]){var l=document.createElement("link");l.rel="preload";l.as="image";l.href=s;l.fetchPriority="high";document.head.appendChild(l)}}}catch(e){}`;

export default function FirstVisitLoader() {
  const [state, setState] = useState<"idle" | "visible" | "exiting" | "done">(
    "idle"
  );

  // Decide once, on mount, whether this render should play the intro. The
  // pre-paint script owns the visual gate; this mirrors its decision so React
  // can drive the exit transition and unmount.
  useEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute(FIRST_VISIT_LOADER_ATTR)) {
      setState("done");
      return;
    }
    setState("visible");
  }, []);

  useEffect(() => {
    if (state !== "visible") return;

    const root = document.documentElement;
    let exitTimer: ReturnType<typeof setTimeout>;

    const start = performance.now();
    const finish = () => {
      const elapsed = performance.now() - start;
      exitTimer = setTimeout(() => {
        setState("exiting");
        setTimeout(() => {
          root.removeAttribute(FIRST_VISIT_LOADER_ATTR);
          setState("done");
        }, EXIT_MS);
      }, Math.max(0, MIN_VISIBLE_MS - elapsed));
    };

    try {
      sessionStorage.setItem(FIRST_VISIT_LOADER_KEY, "1");
    } catch {
      // Private-mode / blocked storage: the intro simply plays every visit.
    }

    // Wait for the window load event so the intro covers font and image work,
    // not just React hydration.
    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      return () => {
        window.removeEventListener("load", finish);
        clearTimeout(exitTimer);
      };
    }

    return () => clearTimeout(exitTimer);
  }, [state]);

  if (state === "done") return null;

  return (
    <div
      className="intro"
      data-exiting={state === "exiting" ? "" : undefined}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading JeetLabs</span>
      <div className="intro-stack">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="intro-mark"
          src={INTRO_MARK_SRC}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          // Intrinsic ratio so the stack has its height before the file
          // arrives; without it the word and rail jumped down on load (CLS).
          width={1400}
          height={1027}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="intro-word"
          src={INTRO_WORD_SRC}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          width={1275}
          height={199}
        />
        {/* Indeterminate rail: page load has no meaningful progress number. */}
        <div className="intro-rail">
          <i />
        </div>
      </div>
    </div>
  );
}
