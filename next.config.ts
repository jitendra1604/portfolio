import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Next doesn't pick up an
  // unrelated lockfile higher up the filesystem (e.g. ~/package-lock.json).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
