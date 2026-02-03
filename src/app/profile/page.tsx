"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, LogOut, Save, MapPin, User, Phone, Clock, Bookmark, Bell, HelpCircle, FileText, Shield, ShieldCheck, AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function ProfilePage() {
    const { user, profile, updateProfile, uploadAvatar, signOut, isLoading, error } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        location_district: "",
        phone: ""
    });
    const [saving, setSaving] = useState(false);

    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <p className="text-gray-500 mb-2">Profile data unavailable.</p>
                {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{error}</p>}
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-green-600 text-white rounded-lg">Retry</button>
                <button onClick={signOut} className="mt-4 text-sm text-gray-500 underline">Sign Out</button>
            </div>
        );
    }
    // Initialize form data when profile loads
    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || "",
                location_district: profile.location_district || "",
                phone: profile.phone || ""
            });
        }
    }, [profile]);

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/");
        }
    }, [user, isLoading, router]);

    const handleSave = async () => {
        setSaving(true);
        await updateProfile(formData);
        setIsEditing(false);
        setSaving(false);
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await uploadAvatar(e.target.files[0]);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <p className="text-gray-500 mb-4">Profile data unavailable.</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-green-600 text-white rounded-lg">Retry</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-30">
                <Link href="/" className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
                {isEditing && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="ml-auto text-green-700 font-bold text-sm px-3 py-1.5 bg-green-50 rounded-full"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                )}
            </div>

            <div className="p-4 flex flex-col items-center gap-6">

                {/* Avatar Section */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-green-100 border-4 border-white shadow-sm overflow-hidden flex items-center justify-center">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold text-green-700 uppercase">
                                {profile.full_name?.[0] || profile.username?.[0] || "U"}
                            </span>
                        )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm cursor-pointer active:scale-95 transition-transform">
                        <Camera size={14} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </label>
                </div>

                {/* Info Card */}
                <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Role Badge */}
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Information</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${profile.role === 'expert' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {profile.role}
                        </span>
                    </div>

                    <div className="p-4 space-y-4">
                        {/* Name Field */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Full Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full p-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500 font-semibold text-gray-900"
                                    placeholder="Enter your name"
                                />
                            ) : (
                                <div className="flex items-center gap-3 text-gray-900 font-bold text-lg">
                                    <User size={18} className="text-gray-400" />
                                    {profile.full_name || "No name set"}
                                </div>
                            )}
                        </div>

                        {/* Location Field */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">District / Location</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.location_district}
                                    onChange={e => setFormData({ ...formData, location_district: e.target.value })}
                                    className="w-full p-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500 font-medium text-gray-900"
                                    placeholder="e.g. Nizamabad"
                                />
                            ) : (
                                <div className="flex items-center gap-3 text-gray-700 font-medium">
                                    <MapPin size={18} className="text-gray-400" />
                                    {profile.location_district || "Location not set"}
                                </div>
                            )}
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Phone Number</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full p-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500 font-medium text-gray-900"
                                    placeholder="+91..."
                                />
                            ) : (
                                <div className="flex items-center gap-3 text-gray-700 font-medium">
                                    <Phone size={18} className="text-gray-400" />
                                    {profile.phone || "No phone linked"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit Toggle */}
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="w-full py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold shadow-sm hover:bg-gray-50"
                    >
                        Edit Profile Details
                    </button>
                )}

                {/* Admin Access */}
                {profile.role === 'admin' && (
                    <Link href="/admin" className="w-full py-4 bg-gradient-to-r from-green-800 to-green-900 rounded-2xl shadow-green-200 shadow-lg flex items-center justify-between px-6 text-white mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">Admin Dashboard</h3>
                                <p className="text-green-100 text-xs">Manage approvals & users</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-green-100" />
                    </Link>
                )}

                {/* Menu Grid */}
                <div className="w-full space-y-3">
                    {/* Activity & Saved */}
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <Link href="/activity" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <Clock size={20} />
                            </div>
                            <div className="flex-1">
                                <span className="font-bold text-gray-800 block text-sm">{t('menu_my_activity') || 'My Activity'}</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300" />
                        </Link>
                        <Link href="/saved" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                <Bookmark size={20} />
                            </div>
                            <div className="flex-1">
                                <span className="font-bold text-gray-800 block text-sm">{t('menu_saved_items') || 'Saved Items'}</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300" />
                        </Link>
                        <Link href="/notifications" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                <Bell size={20} />
                            </div>
                            <div className="flex-1">
                                <span className="font-bold text-gray-800 block text-sm">{t('menu_notifications') || 'Notifications'}</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300" />
                        </Link>
                    </div>

                    {/* Support & Legal */}
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <Link href="/support" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                <HelpCircle size={20} />
                            </div>
                            <div className="flex-1">
                                <span className="font-bold text-gray-800 block text-sm">{t('menu_help_support') || 'Help & Support'}</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300" />
                        </Link>
                        <Link href="/report" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="flex-1">
                                <span className="font-bold text-gray-800 block text-sm">{t('menu_report_issue') || 'Report Issue'}</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300" />
                        </Link>
                        <Link href="/privacy" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                                <Shield size={20} />
                            </div>
                            <div className="flex-1">
                                <span className="font-bold text-gray-800 block text-sm">{t('menu_privacy_policy') || 'Privacy Policy'}</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300" />
                        </Link>
                        <Link href="/terms" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                                <FileText size={20} />
                            </div>
                            <div className="flex-1">
                                <span className="font-bold text-gray-800 block text-sm">{t('menu_terms') || 'Terms & Conditions'}</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300" />
                        </Link>
                    </div>
                </div>

                {/* Sign Out */}
                <button
                    onClick={signOut}
                    className="w-full py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 font-bold flex items-center justify-center gap-2 mt-4 hover:bg-red-100 transition-colors"
                >
                    <LogOut size={18} />
                    {t('profile_logout') || 'Sign Out'}
                </button>

                <div className="text-center mt-4 text-xs text-gray-400">
                    Version 1.0.0 • Keypaper
                </div>

            </div>
        </div>
    );
}
