import { portfolioData } from "@/lib/portfolio";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3004").replace(/\/$/, "");
export const siteIdentity = {
  name: "Jeet",
  jobTitle: "Senior Full Stack Developer",
  githubUsername: "jitendra1604",
  linkedin: portfolioData.contact.linkedin,
  github: portfolioData.contact.github,
};

export const flagshipProjectSlugs = ["yichi", "talitrix", "blox"];
