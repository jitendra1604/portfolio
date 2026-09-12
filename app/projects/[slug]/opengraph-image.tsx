import { ImageResponse } from "next/og";
import { portfolioData } from "@/lib/portfolio";
import { siteUrl } from "@/lib/site";
import { OgBanner, ogImageSize, ogImageContentType, seedFromString } from "@/lib/og";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "Project case study banner";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = portfolioData.projects.find((entry) => entry.slug === slug);
  const host = siteUrl.replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <OgBanner
        seed={seedFromString(slug)}
        eyebrow="Jeet — Case study"
        tag={project?.stack.slice(0, 3).join(" · ") ?? "Project"}
        title={project?.name ?? "Project"}
        footer={`${host}/projects`}
      />
    ),
    { ...size }
  );
}
