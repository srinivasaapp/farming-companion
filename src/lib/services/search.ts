
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface SearchResult {
    id: string;
    type: 'question' | 'listing' | 'news' | 'story' | 'profile';
    title: string;
    subtitle?: string;
    image_url?: string;
    url: string;
    created_at: string;
}

export async function searchAppContent(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    const searchQuery = `%${query}%`;

    // specific field searches for better performance than full text search if not indexed
    const [qRes, lRes, nRes, sRes] = await Promise.all([
        supabase.from('questions')
            .select('id, title, description, created_at')
            .or(`title.ilike.${searchQuery},description.ilike.${searchQuery}`)
            .limit(5),

        supabase.from('listings')
            .select('id, title, price, price_unit, created_at, image_url')
            .eq('status', 'active')
            .or(`title.ilike.${searchQuery},description.ilike.${searchQuery}`)
            .limit(5),

        supabase.from('news')
            .select('id, title, summary, created_at, image_url')
            .or(`title.ilike.${searchQuery},summary.ilike.${searchQuery}`)
            .limit(5),

        supabase.from('stories')
            .select('id, title, expert, created_at')
            .or(`title.ilike.${searchQuery},expert.ilike.${searchQuery}`)
            .limit(5)
    ]);

    const results: SearchResult[] = [];

    // Map Questions
    if (qRes.data) {
        results.push(...qRes.data.map(i => ({
            id: i.id,
            type: 'question' as const,
            title: i.title,
            subtitle: "Q&A",
            url: `/ask?id=${i.id}`, // Assuming we can deep link or just /ask
            created_at: i.created_at
        })));
    }

    // Map Listings
    if (lRes.data) {
        results.push(...lRes.data.map(i => ({
            id: i.id,
            type: 'listing' as const,
            title: i.title,
            subtitle: `₹${i.price}/${i.price_unit}`,
            image_url: i.image_url,
            url: `/market?id=${i.id}`,
            created_at: i.created_at
        })));
    }

    // Map News
    if (nRes.data) {
        results.push(...nRes.data.map(i => ({
            id: i.id,
            type: 'news' as const,
            title: i.title,
            subtitle: "News",
            image_url: i.image_url,
            url: `/learn?id=${i.id}`,
            created_at: i.created_at
        })));
    }

    // Map Stories
    if (sRes.data) {
        results.push(...sRes.data.map(i => ({
            id: i.id,
            type: 'story' as const,
            title: i.title,
            subtitle: `Story by ${i.expert}`,
            url: `/stories`, // Stories usually full screen, maybe just go to feed
            created_at: i.created_at
        })));
    }

    return results;
}
