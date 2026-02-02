"use client";

import React, { useState, useEffect } from "react";
import { Splash } from "../auth/Splash";
import { Login } from "../auth/Login";
import { Signup } from "../auth/Signup";
import { Navigation } from "./Navigation";
import styles from "./Shell.module.css";
import { X, AlertCircle, RefreshCcw, LogOut } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePathname } from "next/navigation";
// import { ContextFAB } from "../common/ContextFAB";

export function Shell({ children }: { children: React.ReactNode }) {
    const {
        user, isLoading, isRepairing, error, signOut,
        showLoginModal, setShowLoginModal
    } = useAuth();

    const pathname = usePathname();

    const [authView, setAuthView] = useState<"login" | "signup">("login");
    const [minimumSplashDone, setMinimumSplashDone] = useState(false);

    // Derived state
    const isLoggedIn = !!user;

    console.log("Shell: State Check", { isLoggedIn, showLoginModal, authView });

    // Minimum splash duration to prevent flickering
    useEffect(() => {
        const timer = setTimeout(() => {
            setMinimumSplashDone(true);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // 1. Terminal Error State (Highest Priority)
    if (error) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorIcon}>
                    <AlertCircle size={48} />
                </div>
                <h1 className={styles.errorTitle}>Connection Delayed</h1>
                <p className={styles.errorText}>
                    {error.includes("timed out")
                        ? "The database is waking up or taking too long. Please wait a moment and try again."
                        : error}
                </p>
                <div className={styles.errorActions}>
                    <button onClick={() => window.location.reload()} className={styles.retryBtn}>
                        <RefreshCcw size={20} /> Retry Connection
                    </button>
                    <button onClick={signOut} className={styles.logoutBtn}>
                        <LogOut size={20} /> Logout & Reset
                    </button>
                </div>
                <p className="mt-8 text-[10px] text-gray-400 font-mono">STATUS: {error.split(':')[0] || 'ID_FAILURE'}</p>
            </div>
        );
    }

    // 2. Booting State (Deterministic)
    // EXCEPTION: Allow /auth/ pages to load immediately (e.g. Password Reset)
    const isAuthPage = pathname?.startsWith('/auth/');

    if (!isAuthPage && (!minimumSplashDone || (isLoading && !isRepairing))) {
        return <Splash onComplete={() => { }} />;
    }

    // 3. Repairing State (Blocking Account Creation)
    if (isRepairing) {
        return (
            <div className="fixed inset-0 bg-white z-[9998] flex flex-col items-center justify-center p-6 text-center">
                <div className="animate-spin h-14 w-14 border-4 border-green-500 border-t-transparent rounded-full mb-6"></div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Setting up your profile...</h2>
                <p className="text-gray-500">Synchronizing your farming data.</p>
            </div>
        );
    }

    // ... code matching end of Shell ...
    // Onboarding Check
    useEffect(() => {
        if (!isLoading && user && profile) {
            // Check if essential fields are missing
            const needsOnboarding = !profile.phone || !profile.location_district;
            const isOnboardingPage = window.location.pathname === '/onboarding';

            if (needsOnboarding && !isOnboardingPage) {
                router.replace('/onboarding');
            }
        }
    }, [user, profile, isLoading, router]);

    return (
        <div className={styles.shell}>
            {/* ... existing JSX ... */}
            <Navigation />
            {/* Global Login Modal for Contextual Actions */}
            {showLoginModal && !isLoggedIn && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalWindow}>
                        <button
                            onClick={() => setShowLoginModal(false)}
                            className={styles.closeButton}
                        >
                            <X size={20} />
                        </button>
                        <div className={styles.modalBody}>
                            {authView === "login" ? (
                                <Login
                                    onLogin={() => setShowLoginModal(false)}
                                    onSwitchToSignup={() => setAuthView("signup")}
                                />
                            ) : (
                                <Signup
                                    onSignupSuccess={() => setShowLoginModal(false)}
                                    onSwitchToLogin={() => setAuthView("login")}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
            <main className={styles.main}>
                {children}
            </main>
            {/* <ContextFAB /> - Removed in favor of FeedHeader */}
            <Navigation />
        </div>
    );
}
