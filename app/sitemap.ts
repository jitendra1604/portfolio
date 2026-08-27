import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { siteUrl } from "@/lib/site";

function validDate(value: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts
      .filter((post) => post.source !== "external")
      .map((post) => {
        const lastModified = validDate(post.date);
        return {
          url: `${siteUrl}/blog/${post.slug}`,
          ...(lastModified ? { lastModified } : {}),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        };
      }),
  ];
}
