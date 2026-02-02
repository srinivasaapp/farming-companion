"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getAllUsers, updateUserRole, updateUserVerification } from "@/lib/services/admin";
import { Search, ShieldCheck, User as UserIcon, Loader2, AlertCircle, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

function UserRow({ u, onUpdate }: { u: any, onUpdate: (user: any) => void }) {
    const [isCustomRole, setIsCustomRole] = useState(false);
    const [customRoleVal, setCustomRoleVal] = useState("");
    const [loading, setLoading] = useState(false);

    // Initialize custom state if the role is non-standard
    useEffect(() => {
        if (u.role && !['farmer', 'expert', 'admin', 'dealer', 'official', 'company', 'fpo'].includes(u.role)) {
            setIsCustomRole(true);
            setCustomRoleVal(u.role);
        }
    }, [u.role]);

    const handleRoleSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'other') {
            setIsCustomRole(true);
            setCustomRoleVal(""); // Blank space as requested
        } else {
            setIsCustomRole(false);
            await updateRole(val);
        }
    };

    const saveCustomRole = async () => {
        if (!customRoleVal.trim()) return;
        await updateRole(customRoleVal.toLowerCase());
    };

    const updateRole = async (role: string) => {
        setLoading(true);
        try {
            await updateUserRole(u.id, role);
            onUpdate({ ...u, role });
        } catch (err) {
            alert("Failed to update role");
        } finally {
            setLoading(false);
        }
    };

    const toggleVerify = async () => {
        setLoading(true);
        try {
            const currentStatus = !!u.is_verified; // Force boolean
            const newStatus = !currentStatus;

            await updateUserVerification(u.id, newStatus);
            onUpdate({ ...u, is_verified: newStatus });
        } catch (err) {
            console.error(err);
            alert("Failed to update verification status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                {u.avatar_url ? (
                    <img src={u.avatar_url} alt={u.full_name} className="w-full h-full object-cover" />
                ) : (
                    <UserIcon className="text-gray-400" size={20} />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 truncate">{u.full_name || 'Unknown'}</h3>
                    {/* Role Badges */}
                    {u.role === 'expert' && <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-bold">XPRT</span>}
                    {u.role === 'admin' && <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded font-bold">ADM</span>}
                    {u.role === 'dealer' && <span className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded font-bold">DLR</span>}
                    {u.role === 'official' && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">OFF</span>}
                    {u.role === 'company' && <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded font-bold">CO</span>}
                    {u.role === 'fpo' && <span className="bg-teal-100 text-teal-700 text-[10px] px-1.5 py-0.5 rounded font-bold">FPO</span>}

                    {/* Verified Badge */}
                    {u.is_verified && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                            <Check size={10} strokeWidth={3} />
                            VERIFIED
                        </span>
                    )}

                    {/* Custom Badge */}
                    {isCustomRole && u.role === customRoleVal && (
                        <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase truncate max-w-[80px]">
                            {u.role}
                        </span>
                    )}
                </div>
                <p className="text-xs text-gray-500 truncate">{u.email}</p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 items-end">
                {/* Role Selector / Input */}
                {isCustomRole ? (
                    <div className="flex items-center gap-1">
                        <input
                            value={customRoleVal}
                            onChange={(e) => setCustomRoleVal(e.target.value)}
                            placeholder="Custom Role"
                            className="w-24 text-[10px] font-bold border rounded-lg px-2 py-1.5 bg-gray-50 outline-none focus:ring-1 focus:ring-green-500"
                            autoFocus
                        />
                        <button onClick={saveCustomRole} disabled={loading} className="p-1.5 bg-green-100 text-green-700 rounded-lg">
                            <Check size={12} />
                        </button>
                        <button onClick={() => setIsCustomRole(false)} className="p-1.5 bg-gray-100 text-gray-500 rounded-lg">
                            <X size={12} />
                        </button>
                    </div>
                ) : (
                    <select
                        value={['farmer', 'expert', 'dealer', 'official', 'company', 'fpo'].includes(u.role) ? u.role : 'other'}
                        onChange={handleRoleSelect}
                        disabled={loading}
                        className="text-[10px] font-bold border rounded-lg px-2 py-1.5 bg-gray-50 text-gray-700 outline-none w-24"
                    >
                        <option value="farmer">Farmer</option>
                        <option value="expert">Expert</option>
                        <option value="dealer">Dealer</option>
                        <option value="official">Official</option>
                        <option value="company">Company</option>
                        <option value="fpo">FPO</option>
                        <option value="other">Other / Custom</option>
                    </select>
                )}

                {/* Verification Toggle */}
                <button
                    onClick={toggleVerify}
                    disabled={loading}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all active:scale-95 ${u.is_verified
                        ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200'
                        : 'bg-white text-gray-400 border-gray-200'
                        }`}
                >
                    {loading ? <Loader2 size={12} className="animate-spin" /> : (u.is_verified ? 'Unverify' : 'Verify')}
                </button>
            </div>
        </div>
    );
}

export default function AdminPage() {
    const { user, profile } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState<string | null>(null);

    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (err: any) {
            console.error("Failed to load users", err);
            setError("Failed to load users. Ensure you have admin permissions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadUsers();
        }
    }, [user]);

    const handleUserUpdate = (updatedUser: any) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!user) {
        return <div className="p-8 text-center">Please log in to access Admin Panel.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="text-green-700" size={24} />
                    <h1 className="text-lg font-bold text-gray-800">Admin Dashboard</h1>
                </div>
                <button onClick={loadUsers} className="text-sm text-green-600 font-bold">Refresh</button>
            </div>

            <div className="p-4 max-w-2xl mx-auto space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-green-600" /></div>
                ) : error ? (
                    <div className="bg-red-50 p-4 rounded-xl text-red-600 flex items-center gap-2">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredUsers.map(u => (
                            <UserRow key={u.id} u={u} onUpdate={handleUserUpdate} />
                        ))}
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12 text-gray-400">No users found.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
