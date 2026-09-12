import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "../../components/JsonLd";
import ArchitectureDiagram from "../../components/ArchitectureDiagram";
import FlowStrip from "../../components/projects/FlowStrip";
import { portfolioData } from "@/lib/portfolio";
import { flagshipProjectSlugs, siteIdentity, siteUrl } from "@/lib/site";
import type { PortfolioProject } from "@/types/portfolio";

// Every project is known from portfolio.json; anything else is a real 404.
export const dynamicParams = false;

const projects = portfolioData.projects;

function findProject(slug: string): PortfolioProject | undefined {
  return projects.find((project) => project.slug === slug);
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) return { title: "Project not found" };

  const title = `${project.name} — ${project.stack.slice(0, 3).join(", ")} case study`;
  const url = `${siteUrl}/projects/${slug}`;
  return {
    title,
    description: project.description,
    keywords: project.stack,
    // Case studies are ~300 visible words and read as summaries. Kept out of
    // the index (and the sitemap, and homepage links) until they carry real
    // numbers and constraints; a thin page ranking hurts more than no page.
    robots: { index: false, follow: false },
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      type: "article",
      url,
      title,
      description: project.description,
    },
    twitter: { card: "summary_large_image", title, description: project.description },
  };
}

function Facts({ project }: { project: PortfolioProject }) {
  const facts = [
    { label: "Role", value: project.role },
    { label: "Period", value: project.period },
    { label: "Team", value: project.team },
    { label: "Stack", value: project.stack.join(" · ") },
  ].filter((fact) => fact.value);

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt className="text-[11px] uppercase tracking-[0.2em] text-caption">{fact.label}</dt>
          <dd className="mt-1.5 text-sm text-ink">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function List({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className="mt-4 space-y-3 text-[15px] leading-7 text-body">
      {items.map((item, index) => (
        <li key={item} className="flex gap-3">
          <span className="mt-[1px] shrink-0 text-xs tabular-nums tracking-[0.2em] text-accent">
            {ordered ? String(index + 1).padStart(2, "0") : "—"}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </Tag>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();

  const index = projects.findIndex((entry) => entry.slug === slug);
  const previous = projects[index - 1];
  const next = projects[index + 1];
  const url = `${siteUrl}/projects/${slug}`;
  const isFlagship = flagshipProjectSlugs.includes(slug);
  const { detail } = project;

  return (
    <article id="top" className="bg-background px-6 pb-24 pt-10 text-ink md:pb-32 md:pt-14">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CreativeWork",
            "@id": url,
            name: project.name,
            headline: project.name,
            description: project.description,
            url,
            keywords: project.stack.join(", "),
            ...(project.url ? { sameAs: project.url } : {}),
            author: {
              "@type": "Person",
              name: siteIdentity.fullName,
              alternateName: siteIdentity.name,
              jobTitle: siteIdentity.jobTitle,
              url: siteUrl,
            },
          },
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Projects", item: `${siteUrl}/#projects` },
            { "@type": "ListItem", position: 3, name: project.name, item: url },
          ] },
        ],
      }} />

      <div className="mx-auto max-w-[1080px]">
        <header className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-32 h-72 w-72 rounded-full bg-accent/[0.07] blur-3xl"
          />
          <nav aria-label="Breadcrumb" className="relative flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-caption">
            <Link href="/#projects" className="transition-colors hover:text-accent">Projects</Link>
            <span aria-hidden="true">/</span>
            <span className="text-accent">{isFlagship ? "Flagship" : "Case study"}</span>
          </nav>

          <h1 className="relative mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            {project.name}
          </h1>
          <p className="relative mt-5 max-w-2xl text-pretty text-xl leading-relaxed text-body">
            {project.description}
          </p>

          {project.outcome ? (
            <p className="relative mt-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/[0.08] px-4 py-2 text-sm text-ink">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
              {project.outcome}
            </p>
          ) : null}

          <div className="relative mt-8 border-y border-line py-6">
            <Facts project={project} />
          </div>

          {project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative mt-6 inline-flex items-center gap-2 text-sm text-accent transition-colors hover:text-ink"
            >
              Visit the live product <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </header>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div className="min-w-0 space-y-12">
            <section>
              <h2 className="text-xs uppercase tracking-[0.28em] text-caption">Architecture</h2>
              <p className="mt-4 text-[15px] leading-7 text-body">{detail.architecture}</p>
              <ArchitectureDiagram decisions={detail.decisions} />
            </section>

            <section>
              <h2 className="text-xs uppercase tracking-[0.28em] text-caption">System flow</h2>
              <div className="mt-4">
                <FlowStrip steps={detail.flow} />
              </div>
              {detail.flow.length > 4 ? <List items={detail.flow} ordered /> : null}
            </section>

            <section>
              <h2 className="text-xs uppercase tracking-[0.28em] text-caption">Technical decisions</h2>
              <List items={detail.decisions} />
            </section>

            <section>
              <h2 className="text-xs uppercase tracking-[0.28em] text-caption">Delivery challenges</h2>
              <List items={detail.challenges} />
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-line bg-surface p-6">
              <h2 className="text-xs uppercase tracking-[0.28em] text-caption">Outcomes</h2>
              <List items={detail.outcomes} />
            </div>

            {project.highlights.length > 0 ? (
              <div className="rounded-xl border border-line bg-surface p-6">
                <h2 className="text-xs uppercase tracking-[0.28em] text-caption">What I built</h2>
                <List items={project.highlights} />
              </div>
            ) : null}

            {detail.screens && detail.screens.length > 0 ? (
              <div className="rounded-xl border border-line bg-surface p-6">
                <h2 className="text-xs uppercase tracking-[0.28em] text-caption">Screens & flows</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {detail.screens.map((screen) => (
                    <span key={screen} className="chip">{screen}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {detail.links && detail.links.length > 0 ? (
              <div className="rounded-xl border border-line bg-surface p-6">
                <h2 className="text-xs uppercase tracking-[0.28em] text-caption">Links</h2>
                <ul className="mt-4 space-y-2 text-sm">
                  {detail.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-ink">
                        {link.label} <span aria-hidden="true">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>

        <nav className="mt-16 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:justify-between">
          {previous ? (
            <Link href={`/projects/${previous.slug}`} className="group max-w-xs">
              <span className="text-xs uppercase tracking-[0.2em] text-caption">← Previous</span>
              <span className="mt-1 block text-ink group-hover:text-accent">{previous.name}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/projects/${next.slug}`} className="group max-w-xs sm:text-right">
              <span className="text-xs uppercase tracking-[0.2em] text-caption">Next →</span>
              <span className="mt-1 block text-ink group-hover:text-accent">{next.name}</span>
            </Link>
          ) : null}
        </nav>

        <p className="mt-10 text-sm text-caption">
          Building something similar?{" "}
          <Link href="/#chat" className="text-accent hover:text-ink">Let&apos;s talk</Link>
        </p>
      </div>
    </article>
  );
}
