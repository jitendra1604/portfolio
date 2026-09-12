export type ProjectLink = {
  label: string;
  href: string;
};

export type ProjectDetail = {
  architecture: string;
  decisions: string[];
  challenges: string[];
  flow: string[];
  outcomes: string[];
  screens?: string[];
  links?: ProjectLink[];
};

export type PortfolioProject = {
  name: string;
  slug: string;
  description: string;
  stack: string[];
  highlights: string[];
  detail: ProjectDetail;
  /** What you did on it — "Lead frontend", "Full stack". */
  role?: string;
  /** "2023" or "2022 – 2024". */
  period?: string;
  /** "Team of 4", "Solo". */
  team?: string;
  /** One headline result, ideally with a number: "100K+ monthly users". */
  outcome?: string;
  /** Public URL, when the product is live. */
  url?: string;
};

export type HowIBuildPillar = {
  title: string;
  description: string;
  points: string[];
};

export type HowIBuildWorkflowStep = {
  label: string;
  title: string;
  description: string;
};

export type PortfolioData = {
  hero: {
    headlineOptions: string[];
    selectedHeadline: string;
    subtitle: string;
    ctaText: string;
  };
  about: {
    title: string;
    description: string;
    highlights: string[];
  };
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    period: string;
    achievements: string[];
  }>;
  projects: PortfolioProject[];
  howIBuild: {
    title: string;
    intro: string;
    pillars: HowIBuildPillar[];
    workflow: HowIBuildWorkflowStep[];
  };
  contact: {
    title: string;
    description: string;
    ctaText: string;
    email: string;
    linkedin: string;
    github: string;
  };
};

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
  website?: string;
};

export type ContactResponse = {
  ok: boolean;
  message: string;
};
