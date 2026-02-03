"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Session, PostgrestSingleResponse, PostgrestResponse } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export type Language = 'en' | 'te';

interface ProfileData {
    id: string;
    username: string;
    full_name: string;
    email: string;
    role: string;
    is_verified: boolean;
    location_district: string | null;
    created_at: string;
    phone: string | null;
    avatar_url: string | null;
    language_preference: Language;
    username_changed_at: string | null;
    stats: {
        questions: number;
        answers: number;
        listings: number;
        trust_score: number;
    };
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: ProfileData | null;
    isLoading: boolean;
    isRepairing: boolean;
    error: string | null;
    lang: Language;
    setLanguage: (newLang: Language) => Promise<void>;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, metadata: any, captchaToken?: string) => Promise<{ error: any; data: any }>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<ProfileData>) => Promise<{ error: any }>;
    uploadAvatar: (file: File) => Promise<{ error: any; url?: string }>;
    resetPasswordForEmail: (email: string) => Promise<{ error: any }>;
    showLoginModal: boolean;
    setShowLoginModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isRepairing: false,
    error: null,
    lang: 'te',
    setLanguage: async () => { },
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null, data: null }),
    signOut: async () => { },
    updateProfile: async () => ({ error: null }),
    uploadAvatar: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: null }),
    showLoginModal: false,
    setShowLoginModal: () => { },
});

// Helper for retrying promises with backoff
async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
        try {
            // Race the operation against a timeout (15s)
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("Operation timed out")), 15000)
            );
            return await Promise.race([operation(), timeoutPromise]);
        } catch (err: any) {
            lastError = err;
            console.warn(`AuthProvider: Attempt ${i + 1} failed. Retrying...`, err.message);
            // Wait with exponential backoff before next try
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, i)));
            }
        }
    }
    throw lastError;
}

const DEFAULT_TIMEOUT = 60000; // Legacy constant kept for compat if needed elsewhere

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRepairing, setIsRepairing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lang, setLang] = useState<Language>('te');
    const [showLoginModal, setShowLoginModal] = useState(false);

    const initializeCalled = useRef(false);

    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();

    const fetchProfile = useCallback(async (userId: string) => {
        return await withRetry(async () => {
            console.log("AuthProvider: Fetching profile for", userId);
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (fetchError) throw fetchError;
            return data as ProfileData;
        }, 2, 1000); // 2 retries, starting at 1s delay
    }, [supabase]);

    const repairProfile = useCallback(async (authUser: User) => {
        setIsRepairing(true);
        console.log("AuthProvider: Repairing/Upserting profile...");
        try {
            const metadata = authUser.user_metadata;
            const username = metadata?.username || authUser.email?.split('@')[0] || `user_${authUser.id.substring(0, 5)}`;

            // Use UPSERT instead of INSERT to handle 23505 (duplicate key) gracefully
            const { error: upsertError } = await withRetry(async () => {
                return await supabase
                    .from('profiles')
                    .upsert({
                        id: authUser.id,
                        email: authUser.email,
                        username: username.substring(0, 15), // Basic safety
                        full_name: metadata?.full_name || username,
                        role: 'user', // Default updated from 'farmer' to 'user'
                        language_preference: 'te'
                    }, { onConflict: 'id' });
            });

            if (upsertError) {
                console.error(`AuthProvider: Profile Upsert Failed [${upsertError.code}]: ${upsertError.message}`);
                throw upsertError;
            }

            // Blocking re-fetch to confirm creation
            const freshProfile = await fetchProfile(authUser.id);
            if (!freshProfile) throw new Error("Profile repaired but could not be verified in database.");

            return freshProfile;
        } finally {
            setIsRepairing(false);
        }
    }, [supabase, fetchProfile]);

    const handleIdentityLifecycle = useCallback(async (authUser: User) => {
        try {
            setError(null);
            console.log("AuthProvider: Handling Lifecycle for", authUser.id);

            let profileData = await fetchProfile(authUser.id);

            if (!profileData) {
                console.warn("AuthProvider: Profile missing or inconsistent, repairing...");
                profileData = await repairProfile(authUser);
            }

            if (profileData) {
                // HARDCODED ADMIN PROMOTION FOR SPECIFIC USER
                if (authUser.email === 'srinivasaagrimallnspt@gmail.com') {
                    if (profileData.role !== 'admin') {
                        console.log("AuthProvider: Syncing hardcoded Admin role to Database...");
                        await supabase.from('profiles').update({ role: 'admin' }).eq('id', authUser.id);
                        profileData.role = 'admin';
                    }
                }

                setProfile(profileData);
                const savedLang = profileData.language_preference as Language || 'te';
                setLang(savedLang);
                localStorage.setItem('lang_preference', savedLang);
                console.log("AuthProvider: Profile successfully established.");
            } else {
                throw new Error("Terminal identity failure: Profile could not be synchronized.");
            }
        } catch (err: any) {
            let msg = err.message || "A secure connection to your profile could not be established.";

            // Intelligent Error Detection for Missing Schema
            if (msg.includes("public.profiles") || err.code === "42P01") {
                msg = "Database Schema Missing: The 'profiles' table was not found. Please ensure you have run the 'db_schema.sql' in your Supabase SQL Editor.";
            }

            console.warn("AuthProvider: Lifecycle Critical Error:", msg);
            // Only set error if we are stuck in a blocking state, or maybe toast it?
            // For now, we set error which will trigger the Error UI.
            // Since this runs in background, the user might be browsing the app when this pops up.
            // This satisfies "show recoverable error" if it fails eventually.
            setError(msg);
            // We don't re-throw here because it's running in background/floating promise
        }
    }, [fetchProfile, repairProfile]);

    useEffect(() => {
        let isMounted = true;

        // FAILSAFE: Force unlock after 12s no matter what happens in the async flow.
        // This guarantees the Splash screen will disappear even if the network hangs or logic errors.
        const failsafeTimer = setTimeout(() => {
            if (isMounted) {
                console.warn("AuthProvider: Failsafe triggered. Forcing app unlock.");
                setIsLoading((prev) => {
                    if (prev) return false;
                    return prev;
                });
            }
        }, 12000);

        const initialize = async () => {
            if (initializeCalled.current) return;
            initializeCalled.current = true;

            if (isMounted) setIsLoading(true);
            console.log("AuthProvider: Initializing...");

            try {
                // 1. Get Session (Fast)
                const { data: { session: initialSession }, error: sessionError } = await withRetry(() =>
                    supabase.auth.getSession()
                    , 2, 500);

                if (sessionError) throw sessionError;

                if (initialSession) {
                    console.log("AuthProvider: Initial session found.");
                    setSession(initialSession);
                    setUser(initialSession.user);

                    // 2. UNBLOCK: Start profile fetch in background, don't await!
                    handleIdentityLifecycle(initialSession.user);
                } else {
                    console.log("AuthProvider: No session found (Guest Mode).");
                }
            } catch (err: any) {
                // Ignore AbortError which happens on component unmount/remount in StrictMode
                if (err.name === 'AbortError' || err.message?.includes('aborted')) {
                    console.log("AuthProvider: Init aborted (benign).");
                    // Do NOT return here, let it fall through to finally to ensure loading state is cleared if needed
                } else {
                    console.error("AuthProvider: Initialization Failed:", err);
                    if (isMounted) setError(err.message || "Failed to initialize secure session.");
                }
            } finally {
                // 3. UNBLOCK: Immediately let the app load
                console.log("AuthProvider: Initialization Complete (Shell Unlocked).");
                clearTimeout(failsafeTimer); // Cleanup failsafe
                if (isMounted) setIsLoading(false);
            }
        };

        initialize();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
                console.log("AuthProvider: AuthStateChange Event:", _event);

                if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED') {
                    // Only show loading for explicit sign-ins, not updates if we already have user
                    if (_event === 'SIGNED_IN') setIsLoading(true);

                    if (newSession?.user) {
                        setSession(newSession);
                        setUser(newSession.user);
                        try {
                            await handleIdentityLifecycle(newSession.user);
                        } catch (err) {
                            console.error("Auth Lifecycle Error:", err);
                        } finally {
                            setIsLoading(false);
                        }
                    }
                } else if (_event === 'TOKEN_REFRESHED') {
                    // SILENT UPDATE: Do not trigger global loading state for token refreshes
                    // This was causing the "stopped in the middle" issue
                    if (newSession) {
                        setSession(newSession);
                        setUser(newSession.user);
                    }
                } else if (_event === 'SIGNED_OUT') {
                    console.log("AuthProvider: Handling SignOut cleanup");
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                    setError(null);
                    setIsLoading(false);
                    router.push("/");
                    router.refresh(); // Ensure strict clear
                }
            }
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [supabase, handleIdentityLifecycle, router]);

    const setLanguage = async (newLang: Language) => {
        setLang(newLang);
        localStorage.setItem('lang_preference', newLang);
        if (user) {
            await supabase.from('profiles').upsert({ id: user.id, language_preference: newLang }).eq('id', user.id);
        }
    };

    const updateProfile = async (updates: Partial<ProfileData>) => {
        if (!user) return { error: { message: "Not authenticated" } };
        const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
        if (!error) {
            const freshData = await fetchProfile(user.id);
            if (freshData) setProfile(freshData);
        }
        return { error };
    };

    const uploadAvatar = async (file: File) => {
        if (!user) return { error: { message: "Not authenticated" } };

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
        if (uploadError) return { error: uploadError };

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);

        if (!updateError) {
            const freshData = await fetchProfile(user.id);
            if (freshData) setProfile(freshData);
        }
        return { error: updateError, url: publicUrl };
    };

    const resetPasswordForEmail = async (email: string) => {
        // 1. Check if user exists in profiles first
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (!profile) {
            return { error: { message: "You don't have a registered account. Please sign up." } };
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

        // Sends a password reset link to the email address
        // Redirects to /auth/update-password (we will create this or handle implicit auth)
        return await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${siteUrl}/auth/callback?next=/auth/update-password`,
        });
    };

    const signIn = async (email: string, password: string) => {
        return await supabase.auth.signInWithPassword({ email, password });
    };

    const signUp = async (email: string, password: string, metadata: any, captchaToken?: string) => {
        return await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
                captchaToken
            },
        });
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{
            user, session, profile, isLoading, isRepairing, error, lang,
            setLanguage, signIn, signUp, signOut, updateProfile, uploadAvatar,
            resetPasswordForEmail,
            showLoginModal, setShowLoginModal
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
