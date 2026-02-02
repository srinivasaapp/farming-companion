"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2, HelpCircle } from "lucide-react";

export default function AskQuestionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            router.push("/ask");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white px-4 py-3 border-b border-gray-100 sticky top-0 z-30 flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Ask the Community</h1>
            </div>

            <form onSubmit={handleUpload} className="p-4 space-y-6 max-w-lg mx-auto">
                <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm flex gap-3">
                    <HelpCircle size={20} className="shrink-0" />
                    <p>Experts and fellow farmers will review your question. Please be as specific as possible.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Your Question</label>
                    <textarea
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-32 resize-none text-lg"
                        placeholder="What's causing these spots on my leaves?"
                        autoFocus
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                        <option>Crop Disease</option>
                        <option>Pest Control</option>
                        <option>Fertilizers</option>
                        <option>Machinery</option>
                        <option>General</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="aspect-square bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-1 hover:bg-gray-50 cursor-pointer transition-colors">
                        <span className="text-xs font-bold">+ Photo</span>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Posting...
                        </>
                    ) : (
                        <>
                            <Send size={20} />
                            Post Question
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
