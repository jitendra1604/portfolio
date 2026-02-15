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

    tl.from(q(".about-title"), {
      y: 40,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
    })
      .from(
        q(".about-description"),
        {
          y: 30,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
        },
        "-=0.4"
      )
      .from(
        q(".about-highlight"),
        {
          y: 20,
          opacity: 0,
          stagger: 0.08,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.3"
      );
  }, []);

  return (
    <section
      id="about"
      ref={scope}
      className="relative py-32 bg-black text-white px-6"
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20">

        {/* LEFT SIDE — Narrative */}
        <div>
          <h2 className="about-title text-4xl md:text-5xl font-bold tracking-tight mb-8">
            {title}
          </h2>

          <p className="about-description text-lg text-gray-400 leading-relaxed max-w-xl">
            {description}
          </p>
        </div>

        {/* RIGHT SIDE — Structured Capability Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

          {highlights.map((item, index) => (
            <div
              key={index}
              className="about-highlight border border-white/10 rounded-xl p-6 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-colors duration-300"
            >
              <p className="text-gray-300 leading-relaxed">
                {item}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}