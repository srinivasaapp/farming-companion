"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Check, ShieldCheck, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

export default function EmailVerifiedPage() {
    const router = useRouter();

    useEffect(() => {
        // Fire confetti on mount
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="p-8 text-center space-y-6">

                    {/* Icon */}
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 relative z-10">
                            <Check size={48} strokeWidth={3} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900">Email Verified!</h1>
                        <p className="text-gray-600">
                            Your account has been successfully verified. You now have full access to Keypaper.
                        </p>
                    </div>

                    <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3 text-left">
                        <div className="bg-white p-2 rounded-full text-green-600 shadow-sm">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-green-900 text-sm">Account Secured</h3>
                            <p className="text-xs text-green-700">You can now post questions, sell items, and more.</p>
                        </div>
                    </div>

                    <Link
                        href="/"
                        className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                    >
                        Continue to Home
                        <ArrowRight size={20} />
                    </Link>

                </div>
            </div>

            <p className="mt-8 text-gray-400 text-xs">
                Keypaper • Farming Companion
            </p>
        </div>
    );
}
