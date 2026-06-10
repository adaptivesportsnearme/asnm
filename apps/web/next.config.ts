import type { NextConfig } from "next";

// Static export (GitHub Pages kickstart — spec decision 15). BASE_PATH is "/asnm" on the
// github.io URL and empty once the custom domain is live.
const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.BASE_PATH ?? "",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
