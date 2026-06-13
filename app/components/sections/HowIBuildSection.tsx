"use client";

import { useCallback } from "react";
import gsap from "gsap";
import { useGsap } from "@/hooks/useGsap";
import { portfolioData } from "@/lib/portfolio";

export default function HowIBuildSection() {
  const section = portfolioData.howIBuild;

  const animateSection = useCallback((gsapInstance: typeof gsap, scopeEl: HTMLElement) => {
    const q = gsapInstance.utils.selector(scopeEl);

    gsapInstance.fromTo(
      q(".how-title"),
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: scopeEl,
          start: "top 85%",
          once: true,
        },
      }
    );

    gsapInstance.fromTo(
      q(".how-card"),
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: scopeEl,
          start: "top 75%",
        },
      }
    );
  }, []);

  const { scope } = useGsap(animateSection);

  return (
    <section
      id="how-i-build"
      ref={scope}
      className="bg-background px-6 py-24 text-ink md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="how-title max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-caption">
            How I Build
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            {section.title}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-body">
            {section.intro}
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {section.pillars.map((pillar) => (
            <article key={pillar.title} className="how-card card">
              <h3 className="text-2xl font-semibold">{pillar.title}</h3>
              <p className="mt-4 text-sm leading-7 text-body">
                {pillar.description}
              </p>
              <ul className="mt-6 space-y-3 text-sm leading-6 text-body">
                {pillar.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-4">
          {section.workflow.map((step) => (
            <div key={step.label} className="how-card card">
              <p className="text-xs uppercase tracking-[0.28em] text-caption">
                {step.label}
              </p>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-body">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
