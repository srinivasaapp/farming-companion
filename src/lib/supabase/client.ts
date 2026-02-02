import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error("Supabase Environment Variables Missing!");
        // Return a dummy client or throw a clear error that the ErrorBoundary can catch
        // Throwing here might crash the app before ErrorBoundary mounted if used in module scope.
        // But we use it in useMemo, so likely inside component tree.
        if (typeof window !== 'undefined') {
            console.error("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
        }
    }

    return createBrowserClient(
        url || 'https://placeholder.supabase.co',
        key || 'placeholder'
    )
}
