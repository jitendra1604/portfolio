"use client";

import { useGsap } from "@/hooks/useGsap";
import portfolioData from "@/data/portfolio.json";

export default function ProjectsSection() {
  const projects = portfolioData?.projects ?? [];

const { scope } = useGsap((gsap, scopeEl) => {
  const q = gsap.utils.selector(scopeEl);

  gsap.from(q(".projects-title"), {
    scrollTrigger: {
      trigger: q(".projects-title")[0],
      start: "top 90%",
      once: true,
    },
    y: 30,
    opacity: 0,
    duration: 0.6,
    ease: "power3.out",
  });

  const cards = q(".project-card");

  cards.forEach((card) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        once: true,
      },
      y: 40,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
    });
  });

}, []);

  if (!projects.length) {
    return (
      <section className="py-32 bg-black text-white text-center">
        <p>No projects found.</p>
      </section>
    );
  }

  return (
    <section
      id="projects"
      ref={scope}
      className="project-card py-32 bg-black text-white px-6"
    >
      <div className="max-w-6xl mx-auto">

        <h2 className="projects-title text-4xl md:text-5xl font-bold mb-16 tracking-tight">
          Selected Projects
        </h2>

        <div className="grid md:grid-cols-2 gap-12">

          {projects.map((project, index) => (
            <div
              key={index}
              className="project-card border border-white/10 rounded-2xl p-8 bg-white/5 hover:border-white/20 transition-all duration-300"
            >
              <h3 className="text-2xl font-semibold mb-4">
                {project.name}
              </h3>

              <p className="text-gray-400 leading-relaxed mb-6">
                {project.description}
              </p>

              {project.stack && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {project.stack.map((tech, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 border border-white/15 rounded-full text-white/70"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {project.highlights && (
                <ul className="space-y-2 text-sm text-gray-400">
                  {project.highlights.slice(0, 2).map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              )}

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}