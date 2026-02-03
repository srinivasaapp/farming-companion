"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2, HelpCircle } from "lucide-react";
import { MediaUploader } from "@/components/common/MediaUploader";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";

export default function AskQuestionPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const { showToast } = useToast();

    // State
    const [question, setQuestion] = useState("");
    const [category, setCategory] = useState("General");
    const [file, setFile] = useState<File | null>(null);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) throw new Error("Login required");

            const { uploadImage, createQuestion } = await import("@/lib/services/api");

            let imageUrl = undefined;
            if (file) {
                imageUrl = await uploadImage(file, 'questions');
            }

            await createQuestion(
                question, // title
                "", // description (optional or merge)
                category, // crop/category
                user.id,
                imageUrl
            );

            // Show success toast
            showToast("Question Posted Successfully!", "success");

            // Wait for 1.5 seconds so user sees the message before redirect
            setTimeout(() => {
                router.push("/ask");
                router.refresh();
            }, 1500);

        } catch (err: any) {
            console.error("Question post failed", err);
            showToast(err.message || "Failed to post question", "error");
            setLoading(false);
        }
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
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                    <select
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="Crop Disease">Crop Disease</option>
                        <option value="Pest Control">Pest Control</option>
                        <option value="Fertilizers">Fertilizers</option>
                        <option value="Machinery">Machinery</option>
                        <option value="General">General</option>
                    </select>
                </div>

                <div className="">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Attachments (Optional)</label>
                    <MediaUploader
                        onFileSelect={(f) => setFile(f)}
                        accept="both"
                        label="Add Photo or Video"
                        showPreview={true}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 ${loading ? "bg-gray-400 text-white" : "bg-blue-600 text-white shadow-blue-600/20"
                        }`}
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
