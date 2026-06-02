import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
    compress: true,
    poweredByHeader: false,
    async headers() {
        return [
            {
                /* Immutable static assets — hashed filenames, safe to cache forever */
                source: '/_next/static/(.*)',
                headers: [
                    {key: 'Cache-Control', value: 'public, max-age=31536000, immutable'},
                ],
            },
            {
                /* Fonts — long-lived, content-addressed */
                source: '/fonts/(.*)',
                headers: [
                    {key: 'Cache-Control', value: 'public, max-age=31536000, immutable'},
                ],
            },
            {
                /* All pages — revalidate on each request but use stale-while-revalidate */
                source: '/((?!_next/static|_next/image|favicon.ico).*)',
                headers: [
                    {key: 'Cache-Control', value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=300'},
                    {key: 'X-Content-Type-Options', value: 'nosniff'},
                    {key: 'X-Frame-Options', value: 'SAMEORIGIN'},
                    {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
                ],
            },
        ];
    },
};

export default nextConfig;
