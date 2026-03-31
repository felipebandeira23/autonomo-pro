import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/configuracoes/brackets',
        destination: '/configuracoes',
        permanent: true,
      },
    ];
  },
  devIndicators: false,
};

export default nextConfig;
