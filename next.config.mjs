 /** @type {import('next').NextConfig} */
const nextConfig = {
    cacheComponents: true,
    experimental: {
        optimizePackageImports: ["@untitledui/icons"],
        viewTransition: true,
    },
    // Cloudflare tunnel uchun
    allowedDevOrigins: [
        'chosen-undertaken-joined-forestry.trycloudflare.com',
        'usgs-pda-friendly-until.trycloudflare.com',
        'publicity-sudden-lafayette-fleet.trycloudflare.com',
        'because-collection-porter-watts.trycloudflare.com',
        'administered-calculators-province-putting.trycloudflare.com',
        'animation-market-stickers-disc.trycloudflare.com',
        'surgeon-threshold-cookies-logical.trycloudflare.com',
        'dennis-part-nuts-flights.trycloudflare.com',
        'deluxe-baking-columbus-gibson.trycloudflare.com',
        'graduated-rose-virtual-workers.trycloudflare.com',
        'vegetarian-capabilities-canberra-broken.trycloudflare.com',
        'collar-waiting-commission-stats.trycloudflare.com',
        'width-entrance-daily-hamilton.trycloudflare.com',
    ],
};

export default nextConfig;
