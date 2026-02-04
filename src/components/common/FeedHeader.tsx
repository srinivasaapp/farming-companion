"use client";

import React, { useState } from "react";
import { Plus, Filter, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

export type UserRole = 'expert' | 'farmer' | 'fpo' | 'company' | 'dealer' | 'other' | 'admin';

interface FeedHeaderProps {
    title: string;
    uploadPath: string;
    selectedRoles: UserRole[];
    onRoleChange: (roles: UserRole[]) => void;
    variant?: 'default' | 'overlay';
    sticky?: boolean;
}

const ALL_ROLES: { value: UserRole, label: string }[] = [
    { value: 'expert', label: 'Expert' },
    { value: 'farmer', label: 'Farmer' },
    { value: 'fpo', label: 'FPO' },
    { value: 'company', label: 'Company' },
    { value: 'dealer', label: 'Dealer' },
    { value: 'other', label: 'Other' },
];

export function FeedHeader({ title, uploadPath, selectedRoles, onRoleChange, variant = 'default', sticky = true }: FeedHeaderProps) {
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
            onRoleChange(newRoles);
        } else {
            onRoleChange([...selectedRoles, role]);
        }
    };

    const isOverlay = variant === 'overlay';

    // Header Styles
    const containerClasses = isOverlay
        ? "fixed top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent border-none text-white pointer-events-none safe-area-top" // pointer-events-none to let touches pass through empty areas? Actually buttons need pointer-events-auto.
        : `${sticky ? 'sticky top-0' : 'relative'} z-30 bg-white border-b border-gray-100 shadow-sm text-gray-800 safe-area-top`;

    // Text & Icon Colors
    const titleColor = isOverlay ? "text-white drop-shadow-md" : "text-gray-800";
    const buttonBg = isOverlay ? "bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/20" : "bg-green-50 text-green-700 hover:bg-green-100";
    const filterBtnBg = isOverlay
        ? (selectedRoles.length > 0 ? "bg-white text-green-600" : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/20")
        : (selectedRoles.length > 0 ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100");

    return (
        <div className={containerClasses}>
            <div className="px-4 py-2 flex items-center justify-between pointer-events-auto">
                {/* Left: Upload Button */}
                <button
                    onClick={handleUploadClick}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${buttonBg}`}
                >
                    <Plus size={24} strokeWidth={2.5} />
                </button>

                {/* Center: Logo & Title */}
                <div className="flex items-center gap-2 pointer-events-auto">
                    <Link href="/">
                        <img
                            src="/logo.png"
                            alt="Keypaper Logo"
                            className="w-7 h-7 object-contain"
                        />
                    </Link>
                    <h1 className={`text-lg font-bold ${titleColor}`}>{title}</h1>
                </div>

                {/* Right: Filter Button */}
                <div className="relative pointer-events-auto">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${filterBtnBg}`}
                    >
                        <Filter size={isOverlay ? 20 : 20} />
                    </button>

                    {/* Filter Dropdown */}
                    {isFilterOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                            <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in zoom-in-95 duration-200 text-gray-800">
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

            {/* Active Filters Bar */}
            {selectedRoles.length > 0 && (
                <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto">
                    {selectedRoles.map(role => (
                        <span key={role} className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${isOverlay ? "bg-white text-green-700" : "bg-blue-50 text-blue-700"}`}>
                            {role}
                        </span>
                    ))}
                    <button onClick={() => onRoleChange([])} className={`text-[10px] underline ml-auto whitespace-nowrap ${isOverlay ? "text-white/80" : "text-gray-400"}`}>Clear All</button>
                </div>
            )}
        </div>
    );
}
