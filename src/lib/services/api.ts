import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function getQuestions(page = 0, limit = 20) {
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
        .from('questions')
        .select(`*, profiles!questions_profile_id_fkey(full_name, username, role)`)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;
    return data || [];
}

// Modified getListings signature to accept filters
export async function getListings(
    type: "buy" | "sell" | "rent",
    page = 0,
    limit = 20,
    filters?: {
        verifiedOnly?: boolean;
        nearLocation?: string; // Simple text match for now
        minPrice?: number;
        maxPrice?: number;
    }
) {
    const from = page * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('listings')
        .select(`
            *,
            profiles!listings_profile_id_fkey (
                full_name,
                role,
                is_verified,
                stats
            )
        `)
        .eq('type', type)
        .eq('status', 'active');

    // Apply Price Filters
    if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
    }
    if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
    }

    // Near Me (Location Text Match)
    // Note: For real "Near Me", we'd need PostGIS. ensuring simple text match for MVP.
    if (filters?.nearLocation) {
        query = query.ilike('location_text', `%${filters.nearLocation}%`);
    }

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error } = await query;
    if (error) throw error;

    // Client-side filtering for 'verifiedOnly' because it depends on join
    // Supabase inner join filtering is tricky without altering the return structure heavily
    // so we filter after fetch for simplicity unless pagination breaks significantly. 
    // Given the MVP scale, this is acceptable.
    let result = data || [];

    if (filters?.verifiedOnly) {
        result = result.filter((item: any) => item.profiles?.is_verified);
    }

    return result;
}

export async function getNews() {
    const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getNewsItem(id: string) {
    const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

export async function getStories() {
    const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createQuestion(title: string, description: string, crop: string, authorId: string, imageUrl?: string) {
    const { data, error } = await supabase
        .from('questions')
        .insert({
            title,
            description,
            crop,
            profile_id: authorId,
            image_url: imageUrl,
            is_solved: false
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function createNews(news: {
    title: string;
    summary: string;
    content?: string;
    image_url?: string;
    author_id: string;
}) {
    const { author_id, summary, ...rest } = news;

    // Schema mismatch fix: DB uses 'content', not 'summary'.
    // If content is provided, use it. If not, use summary as content.
    const payload = {
        ...rest,
        content: rest.content || summary,
        profile_id: author_id
    };

    const { data, error } = await supabase
        .from('news')
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function createStory(story: {
    title: string;
    src?: string;
    image_url?: string;
    expert?: string;
    role: string;
    author_id: string;
}) {
    // Schema mismatch fix: Removed image_url and role as they don't exist in DB
    const { author_id, role: _role, image_url: _ignored, ...rest } = story;
    const { data, error } = await supabase
        .from('stories')
        .insert({
            ...rest,
            profile_id: author_id
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function createListing(listing: {
    title: string;
    description: string;
    price: number;
    price_unit: string;
    location_text: string;
    type: "buy" | "sell" | "rent";
    author_id: string;
    image_url?: string;
}) {
    const { author_id, ...rest } = listing;
    const { data, error } = await supabase
        .from('listings')
        .insert({
            ...rest,
            profile_id: author_id,
            status: 'active'
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function uploadImage(file: File, bucket: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
}

// === Auth & User Checks ===

export async function checkUsername(username: string): Promise<boolean> {
    const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('username', username);

    if (error) {
        console.error("Error checking username:", error);
        return false; // Fail safe (allow trying, catch duplicate later if needed)
    }

    // If count is 0, username is available (true). If > 0, taken (false).
    return count === 0;
}

// === Edit & Delete Operations ===

export async function deleteQuestion(questionId: string) {
    const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

    if (error) throw error;
}

export async function deleteListing(listingId: string) {
    const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

    if (error) throw error;
}

export async function deleteNews(newsId: string) {
    const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', newsId);

    if (error) throw error;
}

export async function deleteStory(storyId: string) {
    const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);

    if (error) throw error;
}

export async function updateQuestion(id: string, updates: Partial<{ title: string; description: string; crop: string; image_url: string }>) {
    const { data, error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateListing(id: string, updates: Partial<{ title: string; description: string; price: number; price_unit: string; location_text: string; type: string; image_url: string }>) {
    const { data, error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// === Admin Operations ===

export async function getAllUsers() {
    // Note: In a real app, this should be protected by RLS or a secure Edge Function
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function updateUserRole(userId: string, role: string) {
    const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateUserVerification(userId: string, isVerified: boolean) {
    const { data, error } = await supabase
        .from('profiles')
        .update({ is_verified: isVerified })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// === Activity & Profile ===

export async function getUserActivity(userId: string) {
    const [qRes, lRes, nRes, sRes] = await Promise.all([
        supabase.from('questions').select('id, title, created_at').eq('profile_id', userId),
        supabase.from('listings').select('id, title, created_at').eq('profile_id', userId),
        supabase.from('news').select('id, title, created_at').eq('profile_id', userId),
        supabase.from('stories').select('id, title, created_at').eq('profile_id', userId)
    ]);

    const activity = [
        ...(qRes.data || []).map(i => ({ ...i, type: 'question' })),
        ...(lRes.data || []).map(i => ({ ...i, type: 'listing' })),
        ...(nRes.data || []).map(i => ({ ...i, type: 'news' })),
        ...(sRes.data || []).map(i => ({ ...i, type: 'story' }))
    ];

    // Sort by Date Descending
    return activity.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// === Comments ===

export async function getComments(postId: string) {
    const { data, error } = await supabase
        .from('comments')
        .select(`
            *,
            profiles (
                full_name,
                username
            )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true }); // Oldest first for comments usually

    if (error) {
        console.error("Error fetching comments:", error);
        return [];
    }

    // Transform flat list to nested structure if needed, or return flat and let UI handle it.
    // For now, return flat.
    return data || [];
}

export async function createComment(comment: {
    post_id: string;
    author_id: string;
    content: string;
    parent_id?: string;
    post_type?: string;
}) {
    const { data, error } = await supabase
        .from('comments')
        .insert(comment)
        .select(`
             *,
            profiles (
                full_name,
                username
            )
        `)
        .single();

    if (error) throw error;
    return data;
}

// === Notifications ===

export async function getNotifications(userId: string) {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function markNotificationRead(id: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

    if (error) throw error;
}

export async function createNotification(notification: {
    user_id: string;
    type: 'reply' | 'like' | 'system';
    content: string;
    related_id?: string;
}) {
    const { error } = await supabase
        .from('notifications')
        .insert(notification);

    if (error) throw error;
}

// === Reporting ===

export async function createReport(report: {
    target_id: string;
    target_type: 'question' | 'listing' | 'news' | 'story' | 'comment' | 'user';
    reason: string;
    description: string;
    reporter_id: string;
}) {
    const { data, error } = await supabase
        .from('reports')
        .insert({
            ...report,
            status: 'pending'
        })
        .select()
        .single();

    if (error) {
        //If table doesn't exist, we fallback to just logging for now or throwing
        console.error("Report submission failed (Table might be missing)", error);
        throw error;
    }
    return data;
}
