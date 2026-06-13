import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
type GSAP = typeof gsap;

export function useGsap<T extends HTMLElement = HTMLElement>(
  callback: (gsap: GSAP, scope: T) => void | (() => void)
) {
  const scope = useRef<T | null>(null);
  // Keep the latest callback without re-running the setup effect on every
  // render (updated in an effect, never during render).
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useLayoutEffect(() => {
    if (!scope.current) return;

    let cleanup: void | (() => void);

    const ctx = gsap.context(() => {
      cleanup = callbackRef.current(gsap, scope.current!);
    }, scope.current);

    // Recompute ScrollTrigger positions after layout AND web fonts settle,
    // otherwise triggers below the fold can be measured wrong and never fire,
    // leaving `from()` elements stuck at opacity:0.
    const refresh = () => ScrollTrigger.refresh();
    const raf = requestAnimationFrame(refresh);
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(refresh).catch(() => {});
    }

    return () => {
      cancelAnimationFrame(raf);
      cleanup?.();
      ctx.revert();
    };
    // Run once on mount — the callback is read through a ref so its identity
    // changing between renders does not retrigger setup (which caused the
    // animations to re-run and freeze at their start values).
  }, []);

  return { scope };
}
