 /** @type {import('next').NextConfig} */
const nextConfig = {
    cacheComponents: true,
    experimental: {
        optimizePackageImports: ["@untitledui/icons"],
        viewTransition: true,
    },
    allowedDevOrigins: ['*.trycloudflare.com'],
};

export default nextConfig;
