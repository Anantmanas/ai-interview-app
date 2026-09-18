import path from 'node:path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['pdf-parse'],
  turbopack: {
    root: path.resolve(process.cwd()),
  },
}

export default nextConfig
