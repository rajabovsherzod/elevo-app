import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    cacheComponents: true,
    experimental: {
        optimizePackageImports: ["@untitledui/icons", "lucide-react"],
        viewTransition: true,
    },
    allowedDevOrigins: ['*.trycloudflare.com'],
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8000',
                pathname: '/media/**',
            },
            {
                protocol: 'https',
                hostname: '*.trycloudflare.com',
                pathname: '/media/**',
            },
            {
                protocol: 'http',
                hostname: '*.trycloudflare.com',
                pathname: '/media/**',
            },
        ],
    },
};

export default withBundleAnalyzer(nextConfig);
