/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
// import path from "node:path";
// import { fileURLToPath } from "node:url";

// const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.dummyjson.com",
      },
    ],
  },
  /**
   * Limit file tracing to project root to avoid EPERM errors on Windows protected directories.
   * This prevents Next.js from scanning outside the project folder.
   */
  // outputFileTracing: false,
  // outputFileTracingRoot: projectRoot,
  // outputFileTracingExcludes: {
  //   "*": [
  //     "generated/**",
  //   ],
  // },
};

export default config;
