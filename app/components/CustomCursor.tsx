"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function EliteCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    // 1. Core Movement (QuickTo for performance)
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.2, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.2, ease: "power3" });
    const xFollowerTo = gsap.quickTo(follower, "x", { duration: 0.6, ease: "power2" });
    const yFollowerTo = gsap.quickTo(follower, "y", { duration: 0.6, ease: "power2" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      xTo(clientX);
      yTo(clientY);
      xFollowerTo(clientX);
      yFollowerTo(clientY);
    };

    // 2. Magnetic Interaction Logic
    const onMouseEnter = (e: MouseEvent) => {
      setIsHovering(true);
      const target = e.currentTarget as HTMLElement;
      const { width, height, left, top } = target.getBoundingClientRect();
      
      // Expand follower and show label
      gsap.to(follower, {
        width: 100,
        height: 100,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        duration: 0.5,
        ease: "elastic.out(1, 0.3)",
      });

      gsap.to(labelRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3
      });

      // Subtle "Magnetic" pull on the button itself
      gsap.to(target, { y: -4, scale: 1.05, duration: 0.3 });
    };

    const onMouseLeave = (e: MouseEvent) => {
      setIsHovering(false);
      const target = e.currentTarget as HTMLElement;
      
      gsap.to(follower, {
        width: 40,
        height: 40,
        backgroundColor: "white",
        duration: 0.4,
        ease: "power2.out"
      });

      gsap.to(labelRef.current, {
        opacity: 0,
        scale: 0.5,
        duration: 0.2
      });

      gsap.to(target, { y: 0, scale: 1, duration: 0.3 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    
    // Select all interactive items
    const interactiveElements = document.querySelectorAll("a, button, .magnetic");
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", onMouseEnter as any);
      el.addEventListener("mouseleave", onMouseLeave as any);
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnter as any);
        el.removeEventListener("mouseleave", onMouseLeave as any);
      });
    };
  }, []);

  return (
    <>
      {/* Liquid Filter */}
      <svg className="hidden">
        <defs>
          <filter id="liquid-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="pointer-events-none fixed inset-0 z-[9999] mix-blend-difference">
        {/* Main Cursor Group */}
        <div style={{ filter: "url(#liquid-goo)" }}>
          <div
            ref={cursorRef}
            className="absolute top-0 left-0 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          />
          <div
            ref={followerRef}
            className="absolute top-0 left-0 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white flex items-center justify-center"
          />
        </div>

        {/* Text Label (Outside filter to keep text sharp) */}
        <div 
          ref={labelRef} 
          className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 opacity-0 scale-50 pointer-events-none"
          style={{ 
            left: 'var(--mouse-x)', 
            top: 'var(--mouse-y)', 
            transform: 'translate(-50%, -50%)' 
          }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-black">
            View
          </span>
        </div>
      </div>
    </>
  );
}