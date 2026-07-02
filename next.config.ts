// next.config.ts
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Tell Turbopack that the root is this project folder
  turbopack: {
    root: __dirname
  }
};

export default nextConfig;
