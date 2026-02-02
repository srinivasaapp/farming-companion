"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { X, Camera } from "lucide-react";

interface EditProfileModalProps {
    onClose: () => void;
}

export function EditProfileModal({ onClose }: EditProfileModalProps) {
    const { user, profile, updateProfile, uploadAvatar } = useAuth();
    const { lang, t } = useLanguage();

    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || "",
        username: profile?.username || "",
        phone: profile?.phone || ""
    });

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !profile) return;
        setIsUpdating(true);

        const updates: any = {
            full_name: formData.full_name,
            phone: formData.phone,
        };

        if (formData.username !== profile.username && !profile.username_changed_at) {
            updates.username = formData.username;
            updates.username_changed_at = new Date().toISOString();
        }

        const { error: updateError } = await updateProfile(updates);
        if (updateError) {
            alert(updateError.message);
        } else {
            onClose();
        }
        setIsUpdating(false);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setIsUpdating(true);
        const { error: uploadError } = await uploadAvatar(file);
        if (uploadError) {
            console.error("Upload error:", uploadError);
            alert("Failed to upload avatar");
        }
        setIsUpdating(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{t('settings_edit_profile')}</h3>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-sm">
                            {profile?.avatar_url && (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-green-700 transition">
                            <Camera size={16} />
                            <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} disabled={isUpdating} />
                        </label>
                    </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {lang === 'te' ? 'పూర్తి పేరు' : 'Full Name'}
                        </label>
                        <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            required
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {lang === 'te' ? 'వినియోగదారు పేరు' : 'Username'}
                        </label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            disabled={!!profile?.username_changed_at}
                            required
                            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition disabled:opacity-60"
                        />
                        {profile?.username_changed_at && (
                            <p className="text-xs text-red-500 mt-1">Username can only be changed once.</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {lang === 'te' ? 'ఫోన్ నంబర్' : 'Phone Number'}
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-gray-600 font-medium bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                        >
                            {t('generic_cancel')}
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 active:scale-95 transition disabled:opacity-70 disabled:pointer-events-none"
                            disabled={isUpdating}
                        >
                            {isUpdating ? <span className="animate-pulse">Saving...</span> : t('generic_save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
