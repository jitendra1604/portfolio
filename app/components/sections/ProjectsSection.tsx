"use client";

import { useCallback, useMemo } from "react";
import gsap from "gsap";
import { useGsap } from "@/hooks/useGsap";
import { portfolioData } from "@/lib/portfolio";
import { flagshipProjectSlugs } from "@/lib/site";
import FlowStrip from "../projects/FlowStrip";
import type { PortfolioProject } from "@/types/portfolio";

/**
 * Seven projects used to be seven identical full-width cards, each hiding
 * its case study behind an accordion. Now the three flagships get a feature
 * card with the system flow drawn on it, the rest sit in a compact grid.
 * Cards deliberately do not link to /projects/[slug]: those pages are noindex
 * until they carry real numbers, and an internal link would invite the crawl.
 */
export default function ProjectsSection() {
  const projects = useMemo(() => portfolioData.projects ?? [], []);
  const featured = useMemo(
    () => flagshipProjectSlugs.map((slug) => projects.find((p) => p.slug === slug)).filter((p): p is PortfolioProject => Boolean(p)),
    [projects]
  );
  const rest = useMemo(() => projects.filter((p) => !flagshipProjectSlugs.includes(p.slug)), [projects]);

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
        scrollTrigger: { trigger: q(".projects-title")[0], start: "top 90%", once: true },
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
          scrollTrigger: { trigger: card, start: "top 85%", once: true },
        }
      );
    });
  }, []);

  const { scope } = useGsap(animateSection);

  if (!projects.length) {
    return (
      <section className="py-32 bg-background text-ink text-center">
        <p>No projects found.</p>
      </section>
    );
  }

  return (
    <section
      id="projects"
      ref={scope}
      className="bg-background px-6 py-20 text-ink md:py-28"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="projects-title mb-14 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-caption">
            Selected Projects
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Product work with architecture depth, not just polished UI.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-body">
            Each case study covers the delivery context behind the interface:
            architecture decisions, system flow, tradeoffs, and the problems the
            implementation had to solve.
          </p>
        </div>

        {/* Flagships */}
        <div className="grid gap-6">
          {featured.map((project, index) => (
            <FeatureCard key={project.slug} project={project} index={index} />
          ))}
        </div>

        {/* The rest */}
        {rest.length > 0 ? (
          <div className="mt-14">
            <p className="text-xs uppercase tracking-[0.3em] text-caption">More work</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {rest.map((project) => (
                <CompactCard key={project.slug} project={project} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Meta({ project }: { project: PortfolioProject }) {
  const facts = [project.role, project.period, project.team].filter(Boolean);
  if (facts.length === 0) return null;
  return (
    <p className="text-xs uppercase tracking-[0.18em] text-caption">
      {facts.join(" · ")}
    </p>
  );
}

function FeatureCard({ project, index }: { project: PortfolioProject; index: number }) {
  return (
    <article className="project-card card group relative">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-xs tabular-nums tracking-[0.2em] text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <Meta project={project} />
          </div>

          <h3 className="mt-3 text-3xl font-semibold tracking-tight">{project.name}</h3>
          <p className="mt-3 max-w-xl text-base leading-7 text-body">{project.description}</p>

          {project.outcome ? (
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-ink">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
              {project.outcome}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <span key={tech} className="chip">{tech}</span>
            ))}
          </div>
        </div>

        <div className="min-w-0 self-center">
          <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-caption">System flow</p>
          <FlowStrip steps={project.detail.flow} compact />
        </div>
      </div>
    </article>
  );
}

function CompactCard({ project }: { project: PortfolioProject }) {
  return (
    <article className="project-card card relative flex flex-col">
      <Meta project={project} />
      <h3 className="mt-2 text-lg font-semibold tracking-tight">{project.name}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-body">{project.description}</p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
        {project.stack.slice(0, 3).map((tech) => (
          <span key={tech} className="chip">{tech}</span>
        ))}
      </div>
    </article>
  );
}
