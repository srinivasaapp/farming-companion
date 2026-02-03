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

export async function getReports() {
    const { data, error } = await supabase
        .from('reports')
        .select(`
            *,
            reporter:profiles!reports_reporter_id_fkey(full_name, username)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Fetch reports failed", error);
        return [];
    }
    return data || [];
}

export async function resolveReport(reportId: string, status: 'resolved' | 'dismissed', adminNotes?: string) {
    const { data, error } = await supabase
        .from('reports')
        .update({ status, admin_notes: adminNotes })
        .eq('id', reportId)
        .select()
        .single();

    if (error) throw error;
    return data;
}
