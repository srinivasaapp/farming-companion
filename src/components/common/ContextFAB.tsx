"use client";

import React from "react";
import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export function ContextFAB() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, setShowLoginModal } = useAuth();

    // Determine context based on path
    const getContext = () => {
        if (!pathname) return null;
        if (pathname.startsWith("/learn")) return { path: "/learn/upload", label: "Upload News" };
        if (pathname.startsWith("/stories")) return { path: "/stories/upload", label: "Upload Story" };
        if (pathname.startsWith("/ask")) return { path: "/ask/upload", label: "Ask Question" };
        if (pathname.startsWith("/market")) return { path: "/market/upload", label: "Sell Item" };
        return null;
    };

    const context = getContext();

    // Don't show if no context or if already on an upload page
    if (!context || pathname?.includes("/upload")) return null;

    const handleClick = () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        router.push(context.path);
    };

    return (
        <button
            onClick={handleClick}
            className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 hover:scale-105 transition-all active:scale-95"
            aria-label={context.label}
        >
            <Plus size={28} strokeWidth={2.5} />
        </button>
    );
}
