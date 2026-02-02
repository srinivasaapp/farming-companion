import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Keypaper',
        short_name: 'Keypaper',
        description: 'From soil to sale – all farming in one app',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#166534',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
