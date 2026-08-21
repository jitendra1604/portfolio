import { ImageResponse } from "next/og";
import { siteUrl } from "@/lib/site";
import { OgBanner, ogImageSize, ogImageContentType, seedFromString } from "@/lib/og";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "Jeet — Senior Full Stack Developer";

export default async function Image() {
  const host = siteUrl.replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <OgBanner
        seed={seedFromString("home")}
        eyebrow="Jeet — Portfolio"
        tag="Full Stack Developer"
        title="Jeet — Senior Full Stack Developer"
        footer={host}
      />
    ),
    { ...size }
  );
}
