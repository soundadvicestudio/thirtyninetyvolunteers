import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Org logo/favicon uploads (Setup Panel, brand public bucket) are served
    // from the deployment's own Supabase Storage project — wildcarded since
    // each OpenCall OS client deployment has its own project subdomain.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
