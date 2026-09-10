"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Top-edge progress bar for client-side route transitions.
 *
 * The App Router has no global router event API, so the bar is started from a
 * capture-phase click on any internal anchor and completed when the rendered
 * pathname / query actually changes. That covers every `next/link` in the app
 * without wrapping each one.
 */

/** Ceiling the trickle creeps toward while the route is still resolving. */
const TRICKLE_CEILING = 92;
/** Give up and clear the bar if a navigation never lands (aborted, blocked). */
const SAFETY_MS = 12_000;
/** Must match the .route-progress fade in globals.css. */
const FADE_MS = 260;

export default function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const rafRef = useRef<number | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningRef = useRef(false);

  const stopTrickle = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (safetyRef.current) clearTimeout(safetyRef.current);
    safetyRef.current = null;
  }, []);

  const complete = useCallback(() => {
    if (!runningRef.current) return;
    runningRef.current = false;
    stopTrickle();
    setProgress(100);
    fadeRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, FADE_MS);
  }, [stopTrickle]);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    if (fadeRef.current) clearTimeout(fadeRef.current);

    setVisible(true);
    setProgress(8);

    // Ease toward the ceiling: fast at first, then asymptotic, so a slow route
    // still looks like it is doing something without ever claiming to be done.
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setProgress((p) => {
        if (p >= TRICKLE_CEILING) return p;
        const remaining = TRICKLE_CEILING - p;
        return p + remaining * (1 - Math.exp(-dt / 900));
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    safetyRef.current = setTimeout(complete, SAFETY_MS);
  }, [complete]);

  // Start on any click that will actually cause an in-app navigation.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || anchor.hasAttribute("download")) return;

      const target = anchor.getAttribute("target");
      if (target && target !== "_self") return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      // Same-document hash jumps (the header's /#home style links) never change
      // pathname or query, so there is no completion signal to wait for.
      const samePage =
        url.pathname === window.location.pathname &&
        url.search === window.location.search;
      if (samePage) return;

      start();
    };

    // Back / forward also swap the route without a click.
    const onPopState = () => start();

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("popstate", onPopState);
    };
  }, [start]);

  // The new route rendered: this is the only reliable "done" signal available.
  useEffect(() => {
    complete();
  }, [pathname, searchParams, complete]);

  useEffect(
    () => () => {
      stopTrickle();
      if (fadeRef.current) clearTimeout(fadeRef.current);
    },
    [stopTrickle]
  );

  if (!visible) return null;

  return (
    <div className="route-progress" aria-hidden="true">
      <div
        className="route-progress-bar"
        style={{ transform: `scaleX(${progress / 100})` }}
      >
        <span className="route-progress-head" />
      </div>
    </div>
  );
}
