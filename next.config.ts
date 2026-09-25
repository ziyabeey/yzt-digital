import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.yzt.digital",
          },
        ],
        destination: "https://yzt.digital/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
