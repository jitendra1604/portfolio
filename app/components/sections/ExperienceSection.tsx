"use client";

import { useGsap } from "@/hooks/useGsap";
import portfolioData from "@/data/portfolio.json";

export default function ExperienceSection() {
  const experiences = portfolioData?.experience ?? [];

  const { scope } = useGsap((gsap, scopeEl) => {
    const q = gsap.utils.selector(scopeEl);

    // Title animation
    gsap.fromTo(
      q(".experience-title"),
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
    q(".experience-item").forEach((item, i) => {
      const direction = i % 2 === 0 ? -50 : 50;

      gsap.fromTo(
        item,
        { x: direction, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
          },
        }
      );
    });

  });

  if (!experiences.length) return null;

  return (
    <section
      id="experience"
      ref={scope}
      className="relative py-24 md:py-32 bg-background text-ink px-6"
    >
      <div className="max-w-[1200px] mx-auto">

        <h2 className="experience-title text-4xl md:text-5xl font-bold mb-24 tracking-tight text-center">
          Experience
        </h2>

        <div className="relative">

          {/* Vertical Line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 hidden md:block w-px bg-white/10">
            <div className="timeline-line w-full h-full bg-white/30 origin-top scale-y-0" />
          </div>

          <div className="space-y-10 md:space-y-24">
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
                    <div className="card">

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                        <h3 className="text-xl font-semibold">
                          {exp.role}
                        </h3>

                        <span className="text-sm text-caption">
                          {exp.period}
                        </span>
                      </div>

                      <p className="text-body font-medium mb-4">
                        {exp.company}
                      </p>

                      {exp.achievements?.length ? (
                        <ul className="space-y-2 text-sm leading-6 text-body">
                          {exp.achievements.slice(0, 3).map((achievement, achievementIndex) => (
                            <li key={achievementIndex}>{achievement}</li>
                          ))}
                        </ul>
                      ) : null}

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
