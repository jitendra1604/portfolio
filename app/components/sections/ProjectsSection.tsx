"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGsap } from "@/hooks/useGsap";
import { portfolioData } from "@/lib/portfolio";

export default function ProjectsSection() {
  const projects = useMemo(() => portfolioData.projects ?? [], []);
  const [openProject, setOpenProject] = useState<string | null>(
    projects[0]?.slug ?? null
  );
  const detailRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const animateSection = useCallback((gsapInstance: typeof gsap, scopeEl: HTMLElement) => {
    const q = gsapInstance.utils.selector(scopeEl);

    gsapInstance.fromTo(
      q(".projects-title"),
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: q(".projects-title")[0],
          start: "top 90%",
          once: true,
        },
      }
    );

    q(".project-card").forEach((card) => {
      gsapInstance.fromTo(
        card,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            once: true,
          },
        }
      );
    });
  }, []);

  const { scope } = useGsap(animateSection);

  useEffect(() => {
    projects.forEach((project) => {
      const element = detailRefs.current[project.slug];
      if (!element) return;

      if (project.slug === openProject) {
        gsap.set(element, { display: "block" });
        gsap.to(element, {
          height: "auto",
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
        });
      } else {
        gsap.to(element, {
          height: 0,
          opacity: 0,
          duration: 0.25,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.set(element, { display: "none" });
          },
        });
      }
    });
  }, [openProject, projects]);

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
      className="bg-background px-6 py-24 text-ink md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="projects-title mb-16 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-caption">
            Selected Projects
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Product work with architecture depth, not just polished UI.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-body">
            Each project includes the delivery context behind the interface:
            architecture decisions, system flow, tradeoffs, and the problems the
            implementation had to solve.
          </p>
        </div>

        <div className="grid gap-6">
          {projects.map((project) => {
            const isOpen = openProject === project.slug;

            return (
              <article key={project.slug} className="project-card card">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap gap-3">
                      {project.stack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-line-strong px-3 py-1 text-xs uppercase tracking-[0.22em] text-muted"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <h3 className="mt-5 text-3xl font-semibold tracking-tight">
                      {project.name}
                    </h3>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-body">
                      {project.description}
                    </p>

                    <ul className="mt-6 space-y-2 text-sm leading-6 text-body">
                      {project.highlights.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex shrink-0 items-start">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenProject((current) =>
                          current === project.slug ? null : project.slug
                        )
                      }
                      aria-expanded={isOpen}
                      className="btn btn-secondary"
                    >
                      {isOpen ? "Hide Details" : "View Details"}
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                        className={`h-3.5 w-3.5 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        <path
                          d="M4 6l4 4 4-4"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div
                  ref={(element) => {
                    detailRefs.current[project.slug] = element;
                  }}
                  className="overflow-hidden"
                  style={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                    display: isOpen ? "block" : "none",
                  }}
                >
                  <div className="mt-8 grid gap-6 border-t border-line pt-8 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-caption">
                          Architecture
                        </p>
                        <p className="mt-3 text-sm leading-7 text-body">
                          {project.detail.architecture}
                        </p>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-caption">
                            Technical Decisions
                          </p>
                          <ul className="mt-3 space-y-3 text-sm leading-7 text-body">
                            {project.detail.decisions.map((decision) => (
                              <li key={decision}>{decision}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-caption">
                            Delivery Challenges
                          </p>
                          <ul className="mt-3 space-y-3 text-sm leading-7 text-body">
                            {project.detail.challenges.map((challenge) => (
                              <li key={challenge}>{challenge}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-xl border border-line bg-black/30 p-5">
                        <p className="text-xs uppercase tracking-[0.28em] text-caption">
                          System Flow
                        </p>
                        <ol className="mt-4 space-y-3 text-sm leading-7 text-body">
                          {project.detail.flow.map((step, index) => (
                            <li key={step}>
                              <span className="mr-2 text-muted">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="rounded-xl border border-line bg-black/30 p-5">
                        <p className="text-xs uppercase tracking-[0.28em] text-caption">
                          Outcomes
                        </p>
                        <ul className="mt-4 space-y-3 text-sm leading-7 text-body">
                          {project.detail.outcomes.map((outcome) => (
                            <li key={outcome}>{outcome}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-xl border border-line bg-black/30 p-5">
                        <p className="text-xs uppercase tracking-[0.28em] text-caption">
                          Screens / Flows
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          {project.detail.screens?.map((screen) => (
                            <span
                              key={screen}
                              className="rounded-full border border-line-strong px-3 py-2 text-xs text-muted"
                            >
                              {screen}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
