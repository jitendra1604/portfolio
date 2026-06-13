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

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { x: mouse.x, y: mouse.y };
    let state = "";
    let visible = false;
    let dotRest = 1;
    let hoverEl: HTMLElement | null = null;
    let magneticEl: HTMLElement | null = null;
    const press = { value: 1 };

    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });

    // --- States -------------------------------------------------------------
    const toDefault = () => {
      if (state === "default") return;
      state = "default";
      hoverEl = null;
      dotRest = 1;
      gsap.set([dot, ring], { mixBlendMode: "difference" });
      gsap.to(ring, {
        width: 36,
        height: 36,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0)",
        borderColor: "rgba(255,255,255,0.6)",
        opacity: visible ? 1 : 0,
        duration: 0.4,
        ease: "power3.out",
      });
      gsap.to(dot, {
        scale: 1,
        backgroundColor: "#ffffff",
        opacity: visible ? 1 : 0,
        duration: 0.3,
      });
    };

    // Wrap the hovered link/button as a rounded highlight.
    const toInteractive = (el: HTMLElement) => {
      if (state === "interactive" && hoverEl === el) return;
      state = "interactive";
      hoverEl = el;
      dotRest = 0.5;
      const rect = el.getBoundingClientRect();
      const radius = Math.min(14, rect.height / 2 + 6);
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
      });
      gsap.to(dot, {
        scale: dotRest,
        backgroundColor: ACCENT,
        opacity: 1,
        duration: 0.3,
      });
    };

    const toText = () => {
      if (state === "text") return;
      state = "text";
      hoverEl = null;
      gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
    };

    // --- Visibility ---------------------------------------------------------
    const show = () => {
      if (visible) return;
      visible = true;
      if (state !== "text") gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
    };
    const hide = () => {
      visible = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.3 });
    };

    // --- Magnetic pull ------------------------------------------------------
    const resetMagnetic = (el: HTMLElement) => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
    };

    // --- Pointer movement ---------------------------------------------------
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      dotX(e.clientX);
      dotY(e.clientY);
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
          const rect = mag.getBoundingClientRect();
          gsap.to(mag, {
            x: (e.clientX - (rect.left + rect.width / 2)) * 0.35,
            y: (e.clientY - (rect.top + rect.height / 2)) * 0.35,
            duration: 0.4,
            ease: "power3.out",
          });
          if (magneticEl && magneticEl !== mag) resetMagnetic(magneticEl);
          magneticEl = mag;
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
    const tick = () => {
      let tx = mouse.x;
      let ty = mouse.y;
      const locked = state === "interactive" && hoverEl;
      if (locked) {
        const rect = hoverEl!.getBoundingClientRect();
        tx = rect.left + rect.width / 2;
        ty = rect.top + rect.height / 2;
      }

      ringPos.x += (tx - ringPos.x) * (reduceMotion ? 1 : 0.22);
      ringPos.y += (ty - ringPos.y) * (reduceMotion ? 1 : 0.22);

      if (reduceMotion) {
        gsap.set(ring, { x: ringPos.x, y: ringPos.y });
        return;
      }

      const dx = mouse.x - ringPos.x;
      const dy = mouse.y - ringPos.y;
      const stretch =
        state === "default" ? Math.min(Math.hypot(dx, dy) / 260, 0.34) : 0;
      const angle = state === "default" ? Math.atan2(dy, dx) * (180 / Math.PI) : 0;

      gsap.set(ring, {
        x: ringPos.x,
        y: ringPos.y,
        rotation: angle,
        scaleX: (1 + stretch) * press.value,
        scaleY: (1 - stretch * 0.7) * press.value,
      });
    };
    gsap.ticker.add(tick);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", hide);
    document.addEventListener("mouseenter", show);

    toDefault();

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", hide);
      document.removeEventListener("mouseenter", show);
      if (magneticEl) resetMagnetic(magneticEl);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[99998] h-9 w-9 rounded-full border-[1.5px] border-white/60 mix-blend-difference"
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[99999] h-1.5 w-1.5 rounded-full bg-white mix-blend-difference"
      />

      <style jsx global>{`
        * {
          cursor: none !important;
        }
        input,
        textarea,
        select,
        [contenteditable="true"] {
          cursor: text !important;
        }
      `}</style>
    </>
  );
}
