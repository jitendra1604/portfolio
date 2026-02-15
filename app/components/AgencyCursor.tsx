"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function RefinedAgencyCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Initial state: Tiny clean dot
    gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 1 });

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3" });

    const handleMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    // --- REFINED INTERACTIONS ---

    // 1. Hero / Large Sections (The "Lens" Look)
    const handleHero = () => {
      document.querySelectorAll(".hero-section").forEach((el) => {
        el.addEventListener("mouseenter", () => {
          gsap.to(cursor, { width: 120, height: 120, backgroundColor: "white", mixBlendMode: "difference", duration: 0.5 });
          if (textRef.current) {
            gsap.to(textRef.current, { opacity: 1, scale: 1, duration: 0.3 });
          }
        });
        el.addEventListener("mouseleave", resetCursor);
      });
    };

    // 2. Menu Links (The "Pill" Look)
    const handleNav = () => {
      document.querySelectorAll(".nav-link").forEach((el) => {
        el.addEventListener("mouseenter", (e) => {
          const target = e.currentTarget as HTMLElement;
          const rect = target.getBoundingClientRect();
          
          // Move cursor to the link and morph into a pill
          gsap.to(cursor, {
            width: rect.width + 20,
            height: rect.height + 10,
            borderRadius: "8px",
            backgroundColor: "rgba(255,255,255,0.1)",
            duration: 0.3,
          });
        });
        el.addEventListener("mouseleave", resetCursor);
      });
    };

    const resetCursor = () => {
      gsap.to(cursor, {
        width: 12,
        height: 12,
        borderRadius: "50%",
        backgroundColor: "white",
        mixBlendMode: "difference",
        duration: 0.4,
      });
      if (textRef.current) {
        gsap.to(textRef.current, { opacity: 0, scale: 0, duration: 0.2 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    handleHero();
    handleNav();

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-[99999] flex items-center justify-center rounded-full bg-white mix-blend-difference w-3 h-3 transition-[width,height,border-radius] duration-300"
      >
        <span
          ref={textRef}
          className="text-[10px] font-bold text-black opacity-0 scale-0 tracking-widest"
        >
          VIEW
        </span>
      </div>

      <style jsx global>{`
        body, a, button { cursor: none !important; }
        .hero-section, .nav-link { cursor: none !important; }
      `}</style>
    </>
  );
}