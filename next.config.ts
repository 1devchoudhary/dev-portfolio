import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Room for a 2 MB résumé upload plus multipart overhead
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
