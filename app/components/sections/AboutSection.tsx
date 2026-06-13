"use client";

import { useGsap } from "@/hooks/useGsap";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import portfolioData from "@/data/portfolio.json";

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const { title, description, highlights } = portfolioData.about;

  const { scope } = useGsap((gsapInstance, scopeEl) => {
    const q = gsapInstance.utils.selector(scopeEl);

    const tl = gsapInstance.timeline({
      scrollTrigger: {
        trigger: scopeEl,
        start: "top 75%",
      },
    });

    tl.fromTo(
      q(".about-title"),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
    )
      .fromTo(
        q(".about-description"),
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
        "-=0.4"
      )
      .fromTo(
        q(".about-highlight"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power2.out" },
        "-=0.3"
      );
  });

  return (
    <section
      id="about"
      ref={scope}
      className="relative py-24 md:py-32 bg-background text-ink px-6"
    >
      <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-20">

        {/* LEFT SIDE — Narrative */}
        <div>
          <h2 className="about-title text-4xl md:text-5xl font-bold tracking-tight mb-8">
            {title}
          </h2>

          <p className="about-description text-lg text-body leading-relaxed max-w-xl">
            {description}
          </p>
        </div>

        {/* RIGHT SIDE — Structured Capability Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {highlights.map((item, index) => (
            <div key={index} className="about-highlight card">
              <p className="text-body leading-relaxed">
                {item}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
