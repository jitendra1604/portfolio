"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGsap } from "@/hooks/useGsap";
import gsap from "gsap";
import Image from "next/image";
import portfolioData from "@/data/portfolio.json";

export default function HeroSection() {
  const { headlineOptions, subtitle, ctaText } = portfolioData.hero;
  const heroStats = [
    { value: "5+", label: "Years building products" },
    { value: "100K+", label: "Users supported" },
    { value: "12", label: "Developers led" },
  ];

  // const [headlineIndex, setHeadlineIndex] = useState(0);
  const currentIndex = useRef(0);
  const headlineRefs = useRef<HTMLSpanElement[]>([]); // Two spans for crossfade

const animateHeadline = useCallback(
  (nextIndex: number) => {
    const current = headlineRefs.current[0];
    const next = headlineRefs.current[1];

    if (!current || !next) return;

    next.textContent = headlineOptions[nextIndex];

    gsap.set(next, {
      y: 40,
      opacity: 0,
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
    });

    const tl = gsap.timeline();

    tl.to(current, {
      y: -40,
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
    }).to(
      next,
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power3.out",
      },
      "-=0.2",
    );

    tl.call(() => {
      headlineRefs.current.reverse();
    });
  },
  [headlineOptions],
);
useEffect(() => {
  const interval = setInterval(() => {
    const nextIndex =
      (currentIndex.current + 1) % headlineOptions.length;

    animateHeadline(nextIndex);

    currentIndex.current = nextIndex;
  }, 6000);

  return () => clearInterval(interval);
}, [animateHeadline, headlineOptions.length]);

  const setupHeroAnimation = useCallback(
    (gsapInstance: typeof gsap, scopeEl: HTMLElement) => {
      const q = gsapInstance.utils.selector(scopeEl);

      gsapInstance.fromTo(
        q(".hero-eyebrow"),
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
      );

      gsapInstance.fromTo(
        q(".hero-panel"),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, delay: 0.2, duration: 0.7, ease: "power3.out" },
      );

      gsapInstance.fromTo(
        q(".hero-subtitle"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, delay: 0.3, duration: 0.8, ease: "power2.out" },
      );

      gsapInstance.fromTo(
        q(".hero-cta"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, delay: 0.5, duration: 0.8, ease: "power2.out" },
      );

      // Image parallax
      gsapInstance.to(q(".hero-image"), {
        y: 25,
        scrollTrigger: {
          trigger: scopeEl,
          start: "top top",
          end: "bottom top",
          scrub: 0.3,
        },
      });
    },
    [],
  );

  const { scope } = useGsap(setupHeroAnimation);

  return (
    <section
      ref={scope}
      id="home"
      className="hero-section relative min-h-[calc(100svh-4rem)] bg-black text-white overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.03),transparent_26%),radial-gradient(circle_at_76%_22%,rgba(255,255,255,0.06),transparent_24%),linear-gradient(135deg,#000000_0%,#040404_42%,#090909_72%,#0b0b0b_100%)] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_42%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.32)_42%,rgba(0,0,0,0.78)_100%)] z-0" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:120px_120px]" />
      <div className="absolute inset-y-0 right-0 z-0 w-[42%] bg-gradient-to-l from-black via-black/88 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[1200px] flex-col justify-center px-6 pb-10 pt-10 sm:pb-12 sm:pt-12 md:px-8 lg:pt-14">
        <div className="grid items-start gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-12">
          <div className="flex flex-col">
            <div className="hero-eyebrow mb-5 inline-flex w-fit items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-caption backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Senior Full Stack Developer
            </div>

            <h1
  className="
    hero-headline
    relative
    h-[210px]
    sm:h-[240px]
    md:h-[280px]
    lg:h-[320px]
    overflow-hidden
    text-4xl
    font-semibold
    leading-[1.02]
    tracking-[-0.04em]
    sm:text-5xl
    md:text-6xl
    lg:text-7xl
  "
>
             <div
                ref={(el) => {
                  if (el) headlineRefs.current[0] = el;
                }}
                className="
                  hero-title
                  absolute
                  left-0
                  top-0
                  block
                  w-full
                  max-w-[700px]
                  will-change-transform
                "
              >
                {headlineOptions[0]}
              </div>
              <div
                ref={(el) => {
                  if (el) headlineRefs.current[1] = el;
                }}
                className="
                  hero-title
                  absolute
                  left-0
                  top-0
                  block
                  w-full
                  max-w-[700px]
                  opacity-0
                  will-change-transform
                "
              />
            </h1>

            <p className="hero-subtitle mt-6 max-w-2xl text-base leading-relaxed text-body sm:text-lg md:text-xl">
              {subtitle}
            </p>

            <div className="hero-cta mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a href="#projects" data-magnetic className="btn btn-primary">
                {ctaText}
              </a>
              <a href="#contact" data-magnetic className="btn btn-secondary">
                Start a Conversation
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="hero-panel border-l border-white/15 pl-4 sm:border-l-0 sm:border-t sm:pl-0 sm:pt-4"
                >
                  <p className="text-3xl font-semibold tracking-tight text-ink">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-caption">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-panel relative h-[clamp(600px,90vh,900px)] w-full overflow-visible">
            {/* soft ambient depth behind the subject */}
            <div className="absolute left-1/2 top-1/4 hidden h-72 w-72 -translate-x-1/2 rounded-full bg-white/[0.04] blur-3xl lg:block" />
            <div
              className="
                    absolute
                    left-1/2
                    -translate-x-1/2
                    top-[-40px]
                    h-[105%]
                    w-[100%]
                right-[-10%]
                    md:top-[-60px]
                    md:w-[115%]
                md:right-[-10%]
                    lg:left-auto
                    lg:translate-x-0
                    lg:right-[-10%]
                    lg:top-[-90px]
                    lg:w-[110%]

                    xl:right-[-25%]
                    xl:w-[115%]
                  "
            >
              <Image
                src="/profile.png"
                alt="Portrait of Jeet"
                fill
                priority
                sizes="(max-width: 1024px) 85vw, 700px"
                className="
                  hero-image
                  object-contain
                  object-bottom
                  object-center
                  lg:object-right
                "
              />
            </div>

            {/* ground the portrait into the page background — exact black point match, no rectangular seam */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
