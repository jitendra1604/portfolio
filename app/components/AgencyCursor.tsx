"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Layered custom cursor:
 *  - a precise inner dot that tracks the real pointer
 *  - a trailing follower that, on empty space, is a small mark with
 *    velocity-based squash & stretch, and on links/buttons morphs into a
 *    rounded highlight that WRAPS the hovered element (frames the click target)
 *  - text fields hand back the native caret
 *  - click/press feedback + magnetic pull on [data-magnetic] elements
 * Only active on fine pointers; respects prefers-reduced-motion.
 */
const ACCENT = "#34d399";

export default function RefinedAgencyCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    const syncPointerMode = () => setEnabled(mediaQuery.matches);
    syncPointerMode();
    mediaQuery.addEventListener("change", syncPointerMode);
    return () => mediaQuery.removeEventListener("change", syncPointerMode);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Park both layers off-screen, not at the implicit 0,0: until the pointer
    // reports a position, anything made visible would sit in the top-left
    // corner. The dot is only written on mousemove, so it would stay there.
    gsap.set([dot, ring], {
      xPercent: -50,
      yPercent: -50,
      opacity: 0,
      x: -9999,
      y: -9999,
      force3D: true,
    });
    // Tailwind's rounded-full is calc(infinity * 1px); GSAP can't tween from
    // that, so every borderRadius tween on the ring silently no-op'd and the
    // wrap highlight stayed a capsule around square targets. Start numeric.
    gsap.set(ring, { borderRadius: 999 });

    const mouse = { x: -9999, y: -9999 };
    const ringPos = { x: mouse.x, y: mouse.y };
    let state = "";
    let visible = false;
    let hasPosition = false;
    let dotRest = 1;
    let hoverEl: HTMLElement | null = null;
    let magneticEl: HTMLElement | null = null;
    const press = { value: 1 };

    // The dot is the "real" pointer, so it must not lag: write its transform
    // synchronously on every move instead of tweening toward it.
    const setDot = gsap.quickSetter(dot, "css") as (v: object) => void;
    const setRing = gsap.quickSetter(ring, "css") as (v: object) => void;
    let magX: ((v: number) => void) | null = null;
    let magY: ((v: number) => void) | null = null;

    // --- States -------------------------------------------------------------
    const toDefault = () => {
      if (state === "default") return;
      state = "default";
      hoverEl = null;
      dotRest = 1;
      gsap.set([dot, ring], { mixBlendMode: "difference" });
      gsap.to(ring, {
        width: 28,
        height: 28,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0)",
        borderColor: "rgba(255,255,255,0.35)",
        opacity: visible ? 1 : 0,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(dot, {
        scale: 1,
        backgroundColor: "#ffffff",
        opacity: visible ? 1 : 0,
        duration: 0.3,
        overwrite: "auto",
      });
    };

    // Wrap the hovered link/button as a rounded highlight.
    const toInteractive = (el: HTMLElement) => {
      if (state === "interactive" && hoverEl === el) return;
      state = "interactive";
      hoverEl = el;
      dotRest = 0.5;
      const rect = el.getBoundingClientRect();
      // The ring takes the element's own corner shape, grown by its inset, so
      // a pill gets a pill and a card gets a card. A fixed radius made every
      // rectangular target look like it had been wrapped in a capsule.
      const ownRadius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
      const ringHeight = rect.height + 14;
      const radius = Math.min(ringHeight / 2, Math.max(6, ownRadius + 7));
      gsap.set([dot, ring], { mixBlendMode: "normal" });
      gsap.to(ring, {
        width: rect.width + 18,
        height: rect.height + 14,
        borderRadius: radius,
        backgroundColor: "rgba(52,211,153,0.10)",
        borderColor: ACCENT,
        opacity: 1,
        duration: 0.35,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(dot, {
        scale: dotRest,
        backgroundColor: ACCENT,
        opacity: 1,
        duration: 0.3,
        overwrite: "auto",
      });
    };

    const toText = () => {
      if (state === "text") return;
      state = "text";
      hoverEl = null;
      gsap.to([dot, ring], { opacity: 0, duration: 0.2, overwrite: "auto" });
    };

    // --- Visibility ---------------------------------------------------------
    // Snap both layers to a known pointer position without tweening, so the
    // cursor never sweeps in from wherever it was parked.
    const placeAt = (x: number, y: number) => {
      mouse.x = x;
      mouse.y = y;
      ringPos.x = x;
      ringPos.y = y;
      gsap.set([dot, ring], { x, y });
      hasPosition = true;
    };

    const show = () => {
      // A page can load with the pointer already inside it, which fires
      // mouseenter before any movement. Staying hidden until the position is
      // known is what keeps the cursor out of the corner.
      if (visible || !hasPosition) return;
      visible = true;
      if (state !== "text")
        gsap.to([dot, ring], { opacity: 1, duration: 0.3, overwrite: "auto" });
    };
    const hide = () => {
      visible = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.3, overwrite: "auto" });
    };

    // --- Magnetic pull ------------------------------------------------------
    const resetMagnetic = (el: HTMLElement) => {
      magX = magY = null;
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)",
        overwrite: "auto",
      });
    };

    // --- Pointer movement ---------------------------------------------------
    const onMove = (e: MouseEvent) => {
      if (!hasPosition) placeAt(e.clientX, e.clientY);
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      setDot({ x: e.clientX, y: e.clientY });
      show();

      const target = e.target as HTMLElement;
      const interactive = target.closest(
        "a, button, .btn, .nav-link, [data-cursor]"
      ) as HTMLElement | null;

      if (target.closest("input, textarea, select, [contenteditable='true']")) {
        toText();
      } else if (interactive) {
        toInteractive(interactive);
      } else {
        toDefault();
      }

      if (!reduceMotion) {
        const mag = target.closest("[data-magnetic]") as HTMLElement | null;
        if (mag) {
          if (magneticEl !== mag) {
            if (magneticEl) resetMagnetic(magneticEl);
            magneticEl = mag;
            // One reusable tween per element instead of a fresh gsap.to on
            // every mousemove (those stacked up and fought each other).
            magX = gsap.quickTo(mag, "x", { duration: 0.4, ease: "power3" });
            magY = gsap.quickTo(mag, "y", { duration: 0.4, ease: "power3" });
          }
          const rect = mag.getBoundingClientRect();
          magX!((e.clientX - (rect.left + rect.width / 2)) * 0.35);
          magY!((e.clientY - (rect.top + rect.height / 2)) * 0.35);
        } else if (magneticEl) {
          resetMagnetic(magneticEl);
          magneticEl = null;
        }
      }
    };

    // --- Press feedback -----------------------------------------------------
    const onDown = () => {
      gsap.to(press, { value: 0.85, duration: 0.2, ease: "power3.out" });
      gsap.to(dot, { scale: dotRest * 0.6, duration: 0.2 });
    };
    const onUp = () => {
      gsap.to(press, { value: 1, duration: 0.4, ease: "back.out(2.5)" });
      gsap.to(dot, { scale: dotRest, duration: 0.3 });
    };

    // --- Ticker: follow + (default-only) squash & stretch -------------------
    // Follow strength is expressed per second and converted with the frame
    // delta, so the ring feels identical at 60Hz, 120Hz and during frame drops
    // (a fixed per-frame factor ran twice as fast on high-refresh displays).
    const FOLLOW = 16;
    const tick = (_time: number, deltaTime: number) => {
      if (!hasPosition) return;
      let tx = mouse.x;
      let ty = mouse.y;
      const locked = state === "interactive" && hoverEl;
      if (locked) {
        const rect = hoverEl!.getBoundingClientRect();
        // The wrap state is anchored to an element, and nothing but a
        // mousemove used to leave it. A client-side navigation removes that
        // element while the pointer sits still, so the ring kept tracking a
        // detached rect — which resolves to 0,0 — and parked itself in the
        // corner, still green and still element-sized. Scrolling the target
        // out from under a stationary pointer stranded it the same way.
        const detached =
          !hoverEl!.isConnected || (rect.width === 0 && rect.height === 0);
        const pointerLeft =
          mouse.x < rect.left ||
          mouse.x > rect.right ||
          mouse.y < rect.top ||
          mouse.y > rect.bottom;

        if (detached || pointerLeft) {
          toDefault();
        } else {
          tx = rect.left + rect.width / 2;
          ty = rect.top + rect.height / 2;
        }
      }

      const k = reduceMotion ? 1 : 1 - Math.exp((-FOLLOW * deltaTime) / 1000);
      ringPos.x += (tx - ringPos.x) * k;
      ringPos.y += (ty - ringPos.y) * k;

      if (reduceMotion) {
        setRing({ x: ringPos.x, y: ringPos.y });
        return;
      }

      const dx = mouse.x - ringPos.x;
      const dy = mouse.y - ringPos.y;
      const stretch =
        state === "default" ? Math.min(Math.hypot(dx, dy) / 260, 0.34) : 0;
      const angle = state === "default" ? Math.atan2(dy, dx) * (180 / Math.PI) : 0;

      setRing({
        x: ringPos.x,
        y: ringPos.y,
        rotation: angle,
        scaleX: (1 + stretch) * press.value,
        scaleY: (1 - stretch * 0.7) * press.value,
      });
    };
    gsap.ticker.add(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    // mouseenter carries coordinates, so the cursor can appear in the right
    // place on entry instead of waiting for the first movement.
    const onEnter = (e: MouseEvent) => {
      placeAt(e.clientX, e.clientY);
      show();
    };

    document.addEventListener("mouseleave", hide);
    document.addEventListener("mouseenter", onEnter);

    toDefault();

    // Only hide the native cursor once the replacement is actually wired up,
    // and via a class we're guaranteed to remove on cleanup — never a static
    // style that could outlive a failed/interrupted effect run.
    document.documentElement.classList.add("custom-cursor-active");

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", hide);
      document.removeEventListener("mouseenter", onEnter);
      document.documentElement.classList.remove("custom-cursor-active");
      if (magneticEl) resetMagnetic(magneticEl);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[99998] h-9 w-9 border-[1.5px] border-white/60 mix-blend-difference will-change-transform"
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[99999] h-1.5 w-1.5 rounded-full bg-white mix-blend-difference will-change-transform"
      />
    </>
  );
}
