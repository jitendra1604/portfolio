import rawPortfolioData from "@/data/portfolio.json";
import type { PortfolioData } from "@/types/portfolio";

export const portfolioData = rawPortfolioData as PortfolioData;

type PortfolioDocument = {
  id: string;
  title: string;
  text: string;
  tags: string[];
};

const projectDocs = portfolioData.projects.map((project) => ({
  id: `project:${project.slug}`,
  title: project.name,
  text: [
    project.name,
    project.description,
    project.stack.join(", "),
    project.highlights.join(". "),
    project.detail.architecture,
    project.detail.decisions.join(". "),
    project.detail.challenges.join(". "),
    project.detail.flow.join(". "),
    project.detail.outcomes.join(". "),
  ].join(". "),
  tags: [project.slug, project.name, ...project.stack],
}));

export const portfolioDocuments: PortfolioDocument[] = [
  {
    id: "about",
    title: portfolioData.about.title,
    text: [
      portfolioData.about.description,
      ...portfolioData.about.highlights,
    ].join(". "),
    tags: ["about", "bio", "experience", "developer"],
  },
  {
    id: "hero",
    title: "Hero",
    text: [
      portfolioData.hero.selectedHeadline,
      portfolioData.hero.subtitle,
    ].join(". "),
    tags: ["hero", "intro", "who is jeet"],
  },
  {
    id: "experience",
    title: "Experience",
    text: portfolioData.experience
      .map((item) =>
        [
          item.role,
          item.company,
          item.duration,
          item.period,
          ...item.achievements,
        ].join(". ")
      )
      .join(". "),
    tags: ["experience", "career", "roles"],
  },
  {
    id: "how-i-build",
    title: portfolioData.howIBuild.title,
    text: [
      portfolioData.howIBuild.intro,
      ...portfolioData.howIBuild.pillars.flatMap((pillar) => [
        pillar.title,
        pillar.description,
        ...pillar.points,
      ]),
      ...portfolioData.howIBuild.workflow.flatMap((step) => [
        step.label,
        step.title,
        step.description,
      ]),
    ].join(". "),
    tags: ["workflow", "ai", "system design", "engineering process"],
  },
  {
    id: "contact",
    title: portfolioData.contact.title,
    text: [
      portfolioData.contact.description,
      `Email ${portfolioData.contact.email}`,
      `LinkedIn ${portfolioData.contact.linkedin}`,
      `GitHub ${portfolioData.contact.github}`,
    ].join(". "),
    tags: ["contact", "email", "linkedin", "github"],
  },
  ...projectDocs,
];

export function getPortfolioContext(limit = 3) {
  return portfolioDocuments.slice(0, limit);
}
