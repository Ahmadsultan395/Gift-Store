/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Local uploads served from public/uploads/ don't need config.
    // Add external domains here only if you paste external image URLs.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",   // allow any https URL pasted as image src
      },
    ],
  },
};

module.exports = nextConfig;
