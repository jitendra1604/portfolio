"use client";

import { useState, useEffect, useRef } from "react";
import { useGsap } from "@/hooks/useGsap";
import gsap from "gsap";
import Image from "next/image";
import portfolioData from "@/data/portfolio.json";

export default function HeroSection() {
  const { headlineOptions, subtitle, ctaText } = portfolioData.hero;

  const [headlineIndex, setHeadlineIndex] = useState(0);
  const headlineRefs = useRef<HTMLSpanElement[]>([]); // Two spans for crossfade

  // Rotate headline every 6s
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (headlineIndex + 1) % headlineOptions.length;
      animateHeadline(nextIndex);
      setHeadlineIndex(nextIndex);
    }, 6000);

    return () => clearInterval(interval);
  }, [headlineIndex, headlineOptions.length]);

  const animateHeadline = (nextIndex: number) => {
    if (!headlineRefs.current[0] || !headlineRefs.current[1]) return;

    const current = headlineRefs.current[0];
    const next = headlineRefs.current[1];

    // Set next text offscreen and invisible
    next.textContent = headlineOptions[nextIndex];
    gsap.set(next, { y: 30, opacity: 0 });

    const tl = gsap.timeline();
    tl.to(current, { y: -30, opacity: 0, duration: 0.5, ease: "power2.in" })
      .to(
        next,
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "-=0.2",
      )
      .call(() => {
        // Swap spans in DOM order
        headlineRefs.current.reverse();
      });
  };

  const { scope } = useGsap((gsap, scopeEl) => {
    const q = gsap.utils.selector(scopeEl);

    gsap.from(q(".hero-subtitle"), {
      y: 20,
      opacity: 0,
      delay: 0.3,
      duration: 0.8,
      ease: "power2.out",
    });

    gsap.from(q(".hero-cta"), {
      y: 20,
      opacity: 0,
      delay: 0.5,
      duration: 0.8,
      ease: "power2.out",
    });

    // Image parallax
    gsap.to(q(".hero-image"), {
      y: 60,
      scale: 1.05,
      ease: "power1.out",
      scrollTrigger: {
        trigger: scopeEl,
        start: "top top",
        end: "bottom top",
        scrub: 0.3,
      },
    });
  }, []);

  return (
    <section
      ref={scope}
      id="home"
      className="hero-section relative min-h-screen bg-black text-white flex items-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-black/70 z-0" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[url('/noise.png')]" />

      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center px-6 md:px-0">
        {/* LEFT */}
        <div className="w-full md:w-1/2 flex flex-col justify-center py-12 md:py-0">
          <h1 className="hero-headline text-4xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight min-h-[140px] overflow-hidden relative">
            <div
              ref={(el) => {
                headlineRefs.current[0] = el!;
              }}
              className="hero-title inline-block will-change-transform"
            >
              {headlineOptions[headlineIndex]}
            </div>

            <div
              ref={(el) => {
                headlineRefs.current[1] = el!;
              }}
              className="inline-block absolute top-0 left-0 w-full will-change-transform opacity-0"
            ></div>
          </h1>

          <p className="hero-subtitle mt-6 text-base sm:text-lg md:text-xl text-gray-300 max-w-xl">
            {subtitle}
          </p>

          <button className="hero-cta mt-8 w-fit px-8 py-4 rounded-full bg-white text-black font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-white/20">
            {ctaText}
          </button>
        </div>

        {/* RIGHT */}
        <div className="w-full md:w-1/2 relative h-[60vh] md:h-screen overflow-hidden">
          <Image
            src="/profile.jpg"
            alt="Portrait"
            fill
            priority
            className="hero-image object-cover md:object-right will-change-transform"
          />
        </div>
      </div>
    </section>
  );
}
