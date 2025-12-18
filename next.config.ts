import type { NextConfig } from "next";
import { getBaseApisFromEnv } from "./lib/env-config";

// Generate rewrites for base APIs from environment
function getBaseApiRewrites() {
  const baseApis = getBaseApisFromEnv();
  
  if (baseApis.length === 0) {
    return [];
  }

  const rewrites: { source: string; destination: string }[] = [];

  for (const api of baseApis) {
    // Rewrite requests from origin endpoint to baseUrl path pattern
    rewrites.push({
      source: `/api/origin/${api.key}/:path*`,
      destination: `${api.baseUrl}/:path*`,
    });
  }

  return rewrites;
}

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: getBaseApiRewrites(),
    };
  },
};

export default nextConfig;
