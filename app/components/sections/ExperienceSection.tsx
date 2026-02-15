"use client";

import { useGsap } from "@/hooks/useGsap";
import portfolioData from "@/data/portfolio.json";

export default function ExperienceSection() {
  const experiences = portfolioData?.experience ?? [];

  const { scope } = useGsap((gsap, scopeEl) => {
    const q = gsap.utils.selector(scopeEl);

    // Title animation
    gsap.from(q(".experience-title"), {
      scrollTrigger: {
        trigger: scopeEl,
        start: "top 85%",
        once: true,
      },
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
    });

    // Timeline line grow
    gsap.fromTo(
      q(".timeline-line"),
      { scaleY: 0 },
      {
        scaleY: 1,
        transformOrigin: "top",
        scrollTrigger: {
          trigger: scopeEl,
          start: "top 80%",
          end: "bottom 70%",
          scrub: true,
        },
      }
    );

    // Items animation
    q(".experience-item").forEach((item: any, i: number) => {
      const direction = i % 2 === 0 ? -50 : 50;

      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: "top 85%",
        },
        x: direction,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      });
    });

  }, []);

  if (!experiences.length) return null;

  return (
    <section
      id="experience"
      ref={scope}
      className="relative py-32 bg-black text-white px-6"
    >
      <div className="max-w-6xl mx-auto">

        <h2 className="experience-title text-4xl md:text-5xl font-bold mb-24 tracking-tight text-center">
          Experience
        </h2>

        <div className="relative">

          {/* Vertical Line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-white/10">
            <div className="timeline-line w-full h-full bg-white/30 origin-top scale-y-0" />
          </div>

          <div className="space-y-24">
            {experiences.map((exp, index) => {
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={index}
                  className={`experience-item relative flex flex-col md:flex-row ${
                    isLeft ? "md:justify-start" : "md:justify-end"
                  }`}
                >
                  <div
                    className={`w-full md:w-1/2 ${
                      isLeft ? "md:pr-12 text-left" : "md:pl-12 text-left"
                    }`}
                  >
                    <div className="border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all duration-300">

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                        <h3 className="text-xl font-semibold">
                          {exp.role}
                        </h3>

                        <span className="text-sm text-white/60">
                          {exp.period}
                        </span>
                      </div>

                      <p className="text-white/70 font-medium mb-4">
                        {exp.company}
                      </p>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}