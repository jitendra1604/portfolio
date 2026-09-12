import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Next doesn't pick up an
  // unrelated lockfile higher up the filesystem (e.g. ~/package-lock.json).
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://avatars.githubusercontent.com https://images.unsplash.com https://plus.unsplash.com https://source.unsplash.com https://res.cloudinary.com https://*.notion.so https://*.notion-static.com https://file.notion.so https://prod-files-secure.s3.us-west-2.amazonaws.com https://prod-files-secure.s3.us-east-2.amazonaws.com; font-src 'self' data:; connect-src 'self' https://api.github.com https://vitals.vercel-insights.com https://*.ably.io wss://*.ably.io https://*.ably-realtime.com wss://*.ably-realtime.com https://*.ably.net wss://*.ably.net; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }, {
      // Brand assets and the portrait are content-addressed by their filename
      // in practice (they change with a deploy, never in place), so let the
      // browser keep them. They shipped with max-age=0 and were re-validated
      // on every visit, which Lighthouse flags and the intro loader feels.
      source: "/(brand/.*|profile\\.png|jeet-logo.*\\.png|favicon.*|android-chrome.*|apple-touch-icon\\.png)",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }];
  },
};

export default nextConfig;
