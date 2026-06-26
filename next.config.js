/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [25, 50, 75, 90, 100],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'kids-guitar-dojo.b-cdn.net',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'images.prismic.io',
        port: '',
      }
    ],
  },
};

module.exports = nextConfig;
