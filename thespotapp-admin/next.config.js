/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "thespotapp-144e2.firebasestorage.app",
      },
    ],
  },
};

module.exports = nextConfig;
