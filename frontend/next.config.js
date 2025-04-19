/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8080/api/:path*',
      },
      {
        source: '/media/:path*',
        destination: 'http://backend:8080/media/:path*',
      },
      {
        source: '/thumbnails/:path*',
        destination: 'http://backend:8080/thumbnails/:path*',
      },
    ]
  },
};

module.exports = nextConfig;