export function getOptimizedImageUrl(url: string | null | undefined, width = 500): string {
    if (!url) return "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=500"; // Fallback placeholder

    // Check if it's a Supabase Storage URL
    if (url.includes('supabase.co/storage/v1/object/public')) {
        // Append transformation params
        // Check if params already exist
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}width=${width}&resize=cover&quality=80`;
    }

    return url;
}
