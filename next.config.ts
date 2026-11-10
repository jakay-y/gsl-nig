import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // A package-lock.json in the user's home folder confuses root detection.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
