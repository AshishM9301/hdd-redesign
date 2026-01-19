/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

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
  outputFileTracingRoot: process.cwd(),
  outputFileTracingExcludes: {
    "*": [
      "C:/Users/**",
      "C:\\Users\\**",
      "**/Application Data/**",
      "**/AppData/**",
      "**/Cookies/**",
      "./generated/**",
    ],
  },
};

export default config;
