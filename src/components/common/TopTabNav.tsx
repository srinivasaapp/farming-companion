"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { Plus, Lock } from "lucide-react";
import { useState } from "react";
import { CreatePostMenu } from "@/components/feed/CreatePostMenu";

interface TopTabNavProps {
    activeTab: 'expert' | 'user';
    onTabChange: (tab: 'expert' | 'user') => void;
    onExpertAdd?: () => void;
    onUserAdd?: () => void;
    showAddButton?: boolean;
}

export function TopTabNav({ activeTab, onTabChange, onExpertAdd, onUserAdd, showAddButton = true }: TopTabNavProps) {
    const { t } = useLanguage();
    const { user, profile, setShowLoginModal } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Check Roles
    const isExpert = profile?.role === 'expert' || profile?.role === 'admin';
    const isLoggedIn = !!user;

    const handlePlusClick = () => {
        if (!isLoggedIn) {
            setShowLoginModal(true);
            return;
        }
        setIsMenuOpen(true);
    };

    return (
        <>
            <div className="w-full bg-white py-1 sticky top-0 z-40 flex items-center justify-center px-4 shadow-sm border-b border-gray-50/50 backdrop-blur-md bg-white/95 h-12">

                {/* 1. Expert Tab */}
                <button
                    onClick={() => onTabChange('expert')}
                    className={`flex-1 text-sm font-bold tracking-widest transition-colors duration-300 text-right pr-6 ${activeTab === 'expert'
                        ? 'text-green-800'
                        : 'text-gray-300 hover:text-gray-400'
                        }`}
                >
                    {t('stories_tab_expert')}
                </button>

                {/* 2. Central Plus Button */}
                {showAddButton && (
                    <div className="shrink-0 relative z-50">
                        <button
                            onClick={handlePlusClick}
                            className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-green-200 shadow-lg transform transition-transform active:scale-90 hover:scale-105 hover:shadow-xl"
                        >
                            <Plus size={20} strokeWidth={3} />
                        </button>
                        {/* Ring effect for emphasis */}
                        <div className="absolute inset-0 rounded-xl border-4 border-green-100 -z-10 scale-110 pointer-events-none"></div>
                    </div>
                )}

                {/* 3. User Tab */}
                <button
                    onClick={() => onTabChange('user')}
                    className={`flex-1 text-sm font-bold tracking-widest transition-colors duration-300 text-left pl-6 ${activeTab === 'user'
                        ? 'text-blue-800'
                        : 'text-gray-300 hover:text-gray-400'
                        }`}
                >
                    {t('stories_tab_user')}
                </button>
            </div>

            {/* Bottom Sheet Menu */}
            <CreatePostMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                userRole={profile?.role}
                onAction={(action) => {
                    console.log("Create action:", action);
                    // Map generic actions to specific props if needed
                    if (action === 'ask') onUserAdd?.();
                    if (action === 'answer') onExpertAdd?.();
                    // Future: route to specific creation pages
                }}
            />
        </>
    );
}
