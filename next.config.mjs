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
};

export default withBundleAnalyzer(nextConfig);
