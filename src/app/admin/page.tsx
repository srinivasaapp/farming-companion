"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getAllUsers, updateUserRole, updateUserVerification, getReports, resolveReport } from "@/lib/services/admin";
import { Search, ShieldCheck, User as UserIcon, Loader2, AlertCircle, Check, X, AlertTriangle, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";

function UserRow({ u, onUpdate }: { u: any, onUpdate: (user: any) => void }) {
    const { showToast } = useToast();
    const [isCustomRole, setIsCustomRole] = useState(false);
    const [customRoleVal, setCustomRoleVal] = useState("");
    const [loading, setLoading] = useState(false);

    // Confirmation State
    const [showConfirm, setShowConfirm] = useState(false);

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
            showToast(`Role updated to ${role}`, "success");
        } catch (err) {
            showToast("Failed to update role", "error");
        } finally {
            setLoading(false);
        }
    };

    const confirmToggleVerify = async () => {
        setLoading(true);
        try {
            const currentStatus = !!u.is_verified; // Force boolean
            const newStatus = !currentStatus;

            await updateUserVerification(u.id, newStatus);
            onUpdate({ ...u, is_verified: newStatus });
            showToast(newStatus ? "User Verified" : "User Unverified", "success");
        } catch (err: any) {
            console.error(err);
            showToast(err.message || "Failed to update verification", "error");
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    return (
        <>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 relative">
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
                        onClick={() => setShowConfirm(true)}
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

            {/* Custom Modal - Only rendered when showConfirm is true */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl scale-100 animate-in zoom-in-95">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${u.is_verified ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                {u.is_verified ? <X size={24} /> : <Check size={24} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {u.is_verified ? "Revoke Verification?" : "Verify User?"}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {u.is_verified
                                        ? `Are you sure you want to remove the verification badge from ${u.full_name}?`
                                        : `Confirm that ${u.full_name} has submitted valid documents.`
                                    }
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 py-2.5 text-gray-700 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmToggleVerify}
                                    disabled={loading}
                                    className={`flex-1 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 ${u.is_verified
                                        ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                                        : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                                        }`}
                                >
                                    {loading ? <Loader2 className="animate-spin mx-auto" /> : (u.is_verified ? "Yes, Revoke" : "Yes, Verify")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default function AdminPage() {
    const { user, profile } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'users' | 'reports'>('users');
    const [reports, setReports] = useState<any[]>([]);

    // Restored State
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [usersData, reportsData] = await Promise.all([
                getAllUsers(),
                getReports()
            ]);
            setUsers(usersData);
            setReports(reportsData);
        } catch (err: any) {
            console.error("Failed to load data", err);
            setError("Failed to load admin data.");
        } finally {
            setLoading(false);
        }
    };

    const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
        try {
            await resolveReport(reportId, status);
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
            showToast(`Report marked as ${status}`, "success");
        } catch (err) {
            showToast("Failed to update report", "error");
        }
    };

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const handleUserUpdate = (updatedUser: any) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pendingReports = reports.filter(r => r.status === 'pending');

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
                <button onClick={loadData} className="text-sm text-green-600 font-bold">Refresh</button>
            </div>

            {/* Tabs */}
            <div className="flex p-4 gap-2">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-white text-gray-600 border border-gray-200'}`}
                >
                    Users
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all relative ${activeTab === 'reports' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white text-gray-600 border border-gray-200'}`}
                >
                    Reports
                    {pendingReports.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                            {pendingReports.length}
                        </span>
                    )}
                </button>
            </div>

            <div className="px-4 max-w-2xl mx-auto space-y-4">
                {activeTab === 'users' && (
                    <>
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
                    </>
                )}

                {activeTab === 'reports' && (
                    <div className="space-y-4">
                        {loading && <div className="flex justify-center py-12"><Loader2 className="animate-spin text-red-600" /></div>}

                        {!loading && reports.length === 0 && (
                            <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                                <ShieldCheck size={48} className="text-gray-200 mb-2" />
                                <p>No reports found. Clean record!</p>
                            </div>
                        )}

                        {reports.map(report => (
                            <div key={report.id} className={`bg-white p-4 rounded-xl border ${report.status === 'pending' ? 'border-red-100 shadow-sm' : 'border-gray-100 opacity-60'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${report.target_type === 'user' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {report.target_type}
                                        </span>
                                        <span className="text-xs text-gray-400">{new Date(report.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${report.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                        report.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {report.status}
                                    </span>
                                </div>

                                <h3 className="font-bold text-red-700 text-sm mb-1">{report.reason}</h3>
                                <p className="text-gray-600 text-sm mb-3 bg-gray-50 p-2 rounded-lg">{report.description || "No details provided."}</p>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-400">
                                        Reported by <span className="font-bold text-gray-600">{report.reporter?.full_name || "Unknown"}</span>
                                    </p>

                                    {report.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleResolveReport(report.id, 'dismissed')}
                                                className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
                                            >
                                                Dismiss
                                            </button>
                                            <button
                                                onClick={() => handleResolveReport(report.id, 'resolved')}
                                                className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-200"
                                            >
                                                Take Action
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
