"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signIn } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get("code");
            const type = searchParams.get("type"); // recovery, invite, etc.
            let next = searchParams.get("next") || "/";

            // Force redirect to update password if it's a recovery flow
            if (type === 'recovery') {
                next = '/auth/update-password';
            }

            if (code) {
                const supabase = createClient();
                const { error } = await supabase.auth.exchangeCodeForSession(code);

                if (!error) {
                    router.push(next);
                } else {
                    setError(error.message);
                }
            } else {
                router.push("/");
            }
        };

        handleCallback();
    }, [searchParams, router]);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    <h3 className="font-bold">Authentication Error</h3>
                    <p>{error}</p>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-500 font-medium">Verifying logic...</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
