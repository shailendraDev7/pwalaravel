/** @type {import('next').NextConfig} */

import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [new URL("https://placehold.co/**")],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /@supabase\/realtime-js/,
      use: "null-loader",
    });
    return config;
  },
};

export default withPWA(nextConfig);
