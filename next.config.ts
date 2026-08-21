import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @resvg/resvg-js loads a platform-specific native (.node) binary via
  // napi-rs — not in Next.js's built-in auto-externalized package list
  // (unlike sharp/canvas/@node-rs/*), so it must be excluded from Server
  // Component bundling or the native binary resolution breaks at runtime.
  serverExternalPackages: ["@resvg/resvg-js"],
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
