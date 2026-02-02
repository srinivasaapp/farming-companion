"use client";

import { User as UserIcon, MapPin, Edit2, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useState } from "react";
import { Login } from "@/components/auth/Login";
import { Signup } from "@/components/auth/Signup";

import { EditProfileModal } from "@/components/profile/EditProfileModal";

export function UserCard() {
    const { user, profile, signOut, showLoginModal, setShowLoginModal } = useAuth();
    const { t } = useLanguage();
    const [isEditOpen, setIsEditOpen] = useState(false);

    if (!user) {
        return (
            <div className="mx-4 mt-4 p-6 bg-green-50 rounded-2xl border border-green-100 text-center">
                <h3 className="font-bold text-green-900 mb-2">{t('welcome_guest')}</h3>
                <p className="text-sm text-green-700 mb-0">{t('guest_desc')}</p>
            </div>
        );
    }

    return (
        <>
            <div className="mx-4 mt-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-600">
                                    <UserIcon size={24} />
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-gray-900">{profile?.full_name || "Farmer"}</h2>
                            <div className="flex items-center text-gray-500 text-sm mt-1">
                                <MapPin size={14} className="mr-1" />
                                <span>{profile?.location_district || "Location not set"}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        className="p-2 text-gray-400 hover:text-green-600"
                        onClick={() => setIsEditOpen(true)}
                    >
                        <Edit2 size={18} />
                    </button>
                </div>
            </div>

            {isEditOpen && <EditProfileModal onClose={() => setIsEditOpen(false)} />}
        </>
    );
}
