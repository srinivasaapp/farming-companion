"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { MediaUploader } from "@/components/common/MediaUploader";

export default function UploadNewsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Basic form state
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [content, setContent] = useState("");

    const [file, setFile] = useState<File | null>(null);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) throw new Error("You must be logged in to post news.");

            let imageUrl = undefined;
            if (file) {
                // Reuse uploadImage from api.ts (needs to be imported or moved to common hook)
                // For now, importing from api works if we export it.
                const { uploadImage, createNews } = await import("@/lib/services/api");
                imageUrl = await uploadImage(file, 'news');

                await createNews({
                    title,
                    summary,
                    content,
                    image_url: imageUrl,
                    author_id: user.id
                });
            } else {
                const { createNews } = await import("@/lib/services/api");
                await createNews({
                    title,
                    summary,
                    content,
                    author_id: user.id
                });
            }

            // Success
            router.push("/learn");
        } catch (err: any) {
            console.error("Upload failed", err);
            alert("Failed to upload news: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 sticky top-0 z-30 flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Upload News</h1>
            </div>

            <form onSubmit={handleUpload} className="p-4 space-y-6 max-w-lg mx-auto">
                {/* Media Upload (Image or Video) */}
                <MediaUploader
                    onFileSelect={(f) => setFile(f)}
                    accept="both"
                    label="Add Cover Image or Video"
                />

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                            placeholder="Enter news headline..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Summary</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 h-24 resize-none"
                            placeholder="Brief summary..."
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Full Content</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 h-48 resize-none"
                            placeholder="Detailed news content..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!!status}
                    className={`w-full font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 ${status ? "bg-gray-400 text-white" : "bg-green-600 text-white shadow-green-600/20"
                        }`}
                >
                    {status ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            {status}
                        </>
                    ) : (
                        <>
                            <Upload size={20} />
                            Publish News
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
