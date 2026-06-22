import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  sassOptions: {
    loadPaths: [path.join(process.cwd(), 'src')],
  },
};

export default nextConfig;
