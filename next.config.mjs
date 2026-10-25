/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "greed.best",
        pathname: "/_next/image",
      },
    ],
  },
};

export default nextConfig;
