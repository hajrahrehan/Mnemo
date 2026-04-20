import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfjs-dist (used by pdf-parse) loads its worker at runtime via import(),
  // which Turbopack can't statically resolve. Marking these as external
  // makes Next.js require them from node_modules at runtime instead of
  // bundling them, so the worker path resolves correctly.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
