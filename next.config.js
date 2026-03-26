/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "canvas", "pdfjs-dist"],
  },
};

module.exports = nextConfig;
