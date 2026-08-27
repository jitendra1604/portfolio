import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";
import { siteUrl } from "@/lib/site";
import { OgBanner, ogImageSize, ogImageContentType, seedFromString } from "@/lib/og";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "Blog post banner";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const title = post?.title ?? "Jeet's Blog";
  const tag = post?.tags[0] ?? "Blog";
  const host = siteUrl.replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <OgBanner
        seed={seedFromString(slug)}
        eyebrow="Jeet — Portfolio"
        tag={tag}
        title={title}
        footer={`${host}/blog`}
        backgroundImage={post?.cover}
      />
    ),
    { ...size }
  );
}
