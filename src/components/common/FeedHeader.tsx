"use client";

import React, { useState } from "react";
import { Plus, Filter, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export type UserRole = 'expert' | 'farmer' | 'fpo' | 'company' | 'dealer' | 'other' | 'admin';

interface FeedHeaderProps {
    title: string;
    uploadPath: string;
    selectedRoles: UserRole[];
    onRoleChange: (roles: UserRole[]) => void;
}

const ALL_ROLES: { value: UserRole, label: string }[] = [
    { value: 'expert', label: 'Expert' },
    { value: 'farmer', label: 'Farmer' },
    { value: 'fpo', label: 'FPO' },
    { value: 'company', label: 'Company' },
    { value: 'dealer', label: 'Dealer' },
    { value: 'other', label: 'Other' },
];

export function FeedHeader({ title, uploadPath, selectedRoles, onRoleChange }: FeedHeaderProps) {
    const router = useRouter();
    const { user, setShowLoginModal } = useAuth();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const handleUploadClick = () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        router.push(uploadPath);
    };

    const toggleRole = (role: UserRole) => {
        if (selectedRoles.includes(role)) {
            const newRoles = selectedRoles.filter(r => r !== role);
            // If empty, maybe reset to all? Or just empty means "All"?
            // Let's say empty means "All" for UI simplicity, but I'll return empty array and let parent handle
            onRoleChange(newRoles);
        } else {
            onRoleChange([...selectedRoles, role]);
        }
    };

    const isAllSelected = selectedRoles.length === 0 || selectedRoles.length === ALL_ROLES.length;

    return (
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
            <div className="px-4 py-3 flex items-center justify-between">
                {/* Left: Upload Button */}
                <button
                    onClick={handleUploadClick}
                    className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-700 hover:bg-green-100 transition-colors"
                >
                    <Plus size={24} strokeWidth={2.5} />
                </button>

                {/* Center: Title */}
                <h1 className="text-lg font-bold text-gray-800">{title}</h1>

                {/* Right: Filter Button */}
                <div className="relative">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${selectedRoles.length > 0 ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Filter size={20} />
                    </button>

                    {/* Filter Dropdown */}
                    {isFilterOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                            <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filter by Role</span>
                                </div>
                                <button
                                    onClick={() => onRoleChange([])}
                                    className="w-full px-4 py-2 text-left text-sm font-medium hover:bg-gray-50 flex items-center justify-between"
                                >
                                    <span>All Roles</span>
                                    {selectedRoles.length === 0 && <Check size={16} className="text-green-600" />}
                                </button>
                                {ALL_ROLES.map((role) => (
                                    <button
                                        key={role.value}
                                        onClick={() => toggleRole(role.value)}
                                        className="w-full px-4 py-2 text-left text-sm font-medium hover:bg-gray-50 flex items-center justify-between"
                                    >
                                        <span>{role.label}</span>
                                        {selectedRoles.includes(role.value) && <Check size={16} className="text-green-600" />}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Active Filters Bar (Optional, if any selected) */}
            {selectedRoles.length > 0 && (
                <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                    {selectedRoles.map(role => (
                        <span key={role} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 capitalize">
                            {role}
                        </span>
                    ))}
                    <button onClick={() => onRoleChange([])} className="text-[10px] text-gray-400 underline ml-auto whitespace-nowrap">Clear All</button>
                </div>
            )}
        </div>
    );
}
