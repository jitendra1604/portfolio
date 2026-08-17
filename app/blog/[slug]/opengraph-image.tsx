import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";
import { siteUrl } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Blog post banner";

function titleFontSize(title: string) {
  if (title.length > 70) return 44;
  if (title.length > 45) return 54;
  return 66;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const title = post?.title ?? "Jeet's Blog";
  const tag = post?.tag ?? "Blog";
  const host = siteUrl.replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: "#0a0a0a",
          backgroundImage: "radial-gradient(circle at 85% 15%, rgba(52,211,153,0.18), transparent 55%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", width: 10, height: 10, borderRadius: 9999, backgroundColor: "#34d399" }} />
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "#34d399", fontWeight: 600 }}>
            Jeet — Portfolio
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 1000 }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              fontSize: 20,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#f5f5f5",
              border: "1px solid #2a2a2a",
              borderRadius: 9999,
              padding: "8px 20px",
            }}
          >
            {tag}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: titleFontSize(title),
              fontWeight: 700,
              lineHeight: 1.15,
              color: "#f5f5f5",
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 20, color: "#a3a3a3" }}>{host}/blog</div>
      </div>
    ),
    { ...size }
  );
}
