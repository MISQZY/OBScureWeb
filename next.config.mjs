import { createMDX } from 'fumadocs-mdx/next';
import path from 'node:path';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Standalone build for the Docker image (see Dockerfile) — bundles only
  // the production deps a request actually needs into .next/standalone.
  output: 'standalone',
  experimental: {
    serverActions: {
      // Template json + preview image uploads (see admin actions) would
      // otherwise hit the 1MB default body size for Server Actions.
      bodySizeLimit: '10mb',
    },
  },
  webpack(webpackConfig) {
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      '@/.source': path.resolve(process.cwd(), '.source'),
    };
    return webpackConfig;
  },
};

export default withMDX(config);
