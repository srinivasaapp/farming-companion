import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

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
