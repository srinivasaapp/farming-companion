"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { ArrowLeft, Camera, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReportPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [issueType, setIssueType] = useState('bug');
    const [desc, setDesc] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        // Mock submission
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSubmitting(false);
        alert("Report submitted successfully! We will look into it.");
        router.push('/profile');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-30">
                <Link href="/profile" className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-lg font-bold text-gray-900">{t('menu_report_issue') || 'Report Issue'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">

                {/* Issue Type */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Issue Type</label>
                    <div className="flex flex-wrap gap-2">
                        {['bug', 'content', 'account', 'other'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setIssueType(type)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${issueType === type
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Description</label>
                    <textarea
                        required
                        className="w-full h-32 p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="Describe the issue in detail..."
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                    ></textarea>
                </div>

                {/* Screenshot (Mock) */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Screenshot (Optional)</label>
                    <button type="button" className="w-full h-24 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 gap-2 hover:border-green-400 hover:text-green-600 transition-colors">
                        <Camera size={24} />
                        <span className="text-xs font-medium">Tap to upload</span>
                    </button>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {submitting ? 'Submitting...' : (
                        <>
                            <Send size={18} />
                            Submit Report
                        </>
                    )}
                </button>

            </form>
        </div>
    );
}
