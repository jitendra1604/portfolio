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
  // Tag pages and /projects/* are noindex (thin listings and summary-level
  // case studies) and deliberately left out of the sitemap so crawl budget
  // goes to the home page and posts.
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
        // Prefer the source's last-edited time: an edited post should signal
        // freshness, and post.date never changes after publication.
        const lastModified = validDate(post.updated ?? "") ?? validDate(post.date);
        return {
          url: `${siteUrl}/blog/${post.slug}`,
          ...(lastModified ? { lastModified } : {}),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        };
      }),
  ];
}
