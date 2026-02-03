import { MetadataRoute } from 'next';

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/auth/', '/profile/'],
        },
        sitemap: 'https://keypaper.in/sitemap.xml',
    };
}
