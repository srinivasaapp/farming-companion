"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, Check, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();
    const supabase = createClient();

    // Ensure user is authenticated (which happens automatically via the magic link)
    // Ensure user is authenticated (which happens automatically via the magic link)
    useEffect(() => {
        // Listen for auth state changes (Recovery flow triggers SIGNED_IN then PASSWORD_RECOVERY)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("UpdatePasswordPage: Auth Event:", event);
            if (session) {
                // Session established, clear any error
                if (message?.type === 'error') setMessage(null);
            } else if (event === 'SIGNED_OUT') {
                setMessage({ type: 'error', text: 'Invalid or expired reset link. Please try again.' });
            }
        });

        // Also check initial state
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // Don't show error immediately, give it a moment for the hash to parse
                setTimeout(() => {
                    supabase.auth.getSession().then(({ data: { session: retrySession } }) => {
                        if (!retrySession) {
                            setMessage({ type: 'error', text: 'Invalid or expired reset link. Please try again.' });
                        }
                    });
                }, 2000);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        setLoading(false);

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            // Redirect after delay
            setTimeout(() => {
                router.push("/");
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <img src="/logo.png" alt="Keypaper" className="w-20 h-20 object-contain" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Set new password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Please enter your new strong password below.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {message && (
                        <div className={`mb-4 p-4 rounded-md flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                            }`}>
                            {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                            <span className="text-sm font-medium">{message.text}</span>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleUpdatePassword}>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    placeholder="••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    placeholder="••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading || (message?.type === 'success')}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Update Password"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
