"use client";

import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, Check } from 'lucide-react';
import { createReport } from '@/lib/services/api';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetId: string;
    targetType: 'question' | 'listing' | 'news' | 'story' | 'comment' | 'user';
}

const REPORT_REASONS = [
    "Hate Speech",
    "Harassment & Abuse",
    "Vulgar / Sexual Content",
    "Spam / Scam",
    "Misinformation",
    "Other"
];

export function ReportModal({ isOpen, onClose, targetId, targetType }: ReportModalProps) {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [reason, setReason] = useState<string>("");
    const [desc, setDesc] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!reason) {
            showToast("Please select a reason", "error");
            return;
        }

        setLoading(true);
        try {
            await createReport({
                target_id: targetId,
                target_type: targetType,
                reason,
                description: desc,
                reporter_id: user.id
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setReason("");
                setDesc("");
            }, 2000);
        } catch (err) {
            console.error(err);
            showToast("Failed to submit report. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center space-y-4 shadow-xl scale-100 animate-in zoom-in-95">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Check size={32} strokeWidth={3} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Report Sent</h3>
                    <p className="text-gray-500">Thank you for helping keep our community safe. Our admins will review this shortly.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] scale-100 animate-in zoom-in-95">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
                    <div className="flex items-center gap-2 text-red-600">
                        <ShieldAlert size={24} />
                        <h2 className="text-lg font-bold">Report Content</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-6">
                    <div className="bg-red-50 p-3 rounded-lg flex gap-3 items-start text-red-800 text-sm">
                        <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                        <p>We take strict action against hate speech, vulgarity, and abuse. False reporting may lead to account suspension.</p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Why are you reporting this?</label>
                        <div className="grid grid-cols-1 gap-2">
                            {REPORT_REASONS.map(r => (
                                <label
                                    key={r}
                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${reason === r
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-gray-100 hover:border-red-100'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r}
                                        checked={reason === r}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                                    />
                                    <span className={`font-semibold ${reason === r ? 'text-red-900' : 'text-gray-700'}`}>{r}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Additional Details (Optional)</label>
                        <textarea
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-red-500 focus:ring-0 outline-none min-h-[100px] text-sm"
                            placeholder="Please provide any specific details..."
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !reason}
                        className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        {loading ? "Submitting..." : "Submit Report"}
                    </button>
                </div>
            </div>
        </div>
    );
}
