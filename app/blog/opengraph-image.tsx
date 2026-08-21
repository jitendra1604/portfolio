import { ImageResponse } from "next/og";
import { siteUrl } from "@/lib/site";
import { OgBanner, ogImageSize, ogImageContentType, seedFromString } from "@/lib/og";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "Jeet's Blog";

export default async function Image() {
  const host = siteUrl.replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <OgBanner
        seed={seedFromString("blog-index")}
        eyebrow="Jeet — Portfolio"
        tag="Writing"
        title="Blog — code, career, and whatever I'm figuring out"
        footer={`${host}/blog`}
      />
    ),
    { ...size }
  );
}
