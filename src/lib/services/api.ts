import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function getQuestions(page = 0, limit = 20) {
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
        .from('questions')
        .select(`*, profiles(full_name, username, role)`)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;
    return data || [];
}

export async function getListings(type: "buy" | "sell" | "rent", page = 0, limit = 20) {
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
        .from('listings')
        .select(`
            *,
            profiles (
                full_name,
                role,
                is_verified,
                stats
            )
        `)
        .eq('type', type)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;
    return data || [];
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
            user_id: authorId, // Fixed column name
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
    const { author_id, ...rest } = news;
    const { data, error } = await supabase
        .from('news')
        .insert({
            ...rest,
            user_id: author_id // Fixed column name
        })
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
    const { author_id, ...rest } = story;
    const { data, error } = await supabase
        .from('stories')
        .insert({
            ...rest,
            user_id: author_id // Fixed column name
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
            user_id: author_id, // Fixed column name
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
