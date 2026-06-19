import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    position: 'top-right',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'fdn2.gsmarena.com' },
      { protocol: 'https', hostname: 'fdn.gsmarena.com' },
      { protocol: 'https', hostname: 'images.samsung.com' },
      { protocol: 'https', hostname: 'images.contentstack.io' },
      { protocol: 'https', hostname: 'techxpressug.com' },
      { protocol: 'https', hostname: 'samtronixguyana.com' },
    ],
  },
};

export default nextConfig;
