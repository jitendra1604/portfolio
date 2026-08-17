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

// Deterministic per-slug hash (FNV-1a) so a given post always renders the
// same generative pattern, but different posts look visually distinct.
function hashString(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Shape = {
  type: "circle" | "ring" | "line";
  x: number;
  y: number;
  size: number;
  rotate?: number;
  opacity: number;
  tone: "accent" | "ink";
};

// Scatters shapes across the top band and bottom-right corner, staying clear
// of the title's bottom-left reading zone.
function generateShapes(seed: number): Shape[] {
  const rand = mulberry32(seed);
  const count = 6 + Math.floor(rand() * 4);
  const shapes: Shape[] = [];

  for (let i = 0; i < count; i++) {
    const inTopBand = i % 3 !== 0;
    const x = 620 + rand() * 520;
    const y = inTopBand ? 40 + rand() * 210 : 440 + rand() * 150;
    const roll = rand();
    const type: Shape["type"] = roll < 0.45 ? "circle" : roll < 0.8 ? "line" : "ring";
    const size = type === "line" ? 40 + rand() * 90 : 8 + rand() * 34;

    shapes.push({
      type,
      x,
      y,
      size,
      rotate: type === "line" ? -60 + rand() * 120 : undefined,
      opacity: 0.16 + rand() * 0.42,
      tone: rand() < 0.75 ? "accent" : "ink",
    });
  }

  return shapes;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const title = post?.title ?? "Jeet's Blog";
  const tag = post?.tag ?? "Blog";
  const host = siteUrl.replace(/^https?:\/\//, "");
  const shapes = generateShapes(hashString(slug));

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
          position: "relative",
        }}
      >
        {shapes.map((shape, i) => {
          const color = shape.tone === "accent" ? "52,211,153" : "245,245,245";
          if (shape.type === "line") {
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  position: "absolute",
                  left: shape.x,
                  top: shape.y,
                  width: shape.size,
                  height: 3,
                  backgroundColor: `rgba(${color},${shape.opacity})`,
                  transform: `rotate(${shape.rotate}deg)`,
                }}
              />
            );
          }
          return (
            <div
              key={i}
              style={{
                display: "flex",
                position: "absolute",
                left: shape.x,
                top: shape.y,
                width: shape.size,
                height: shape.size,
                borderRadius: 9999,
                ...(shape.type === "ring"
                  ? { border: `2px solid rgba(${color},${shape.opacity})` }
                  : { backgroundColor: `rgba(${color},${shape.opacity})` }),
              }}
            />
          );
        })}

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
