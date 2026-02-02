"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2, Video } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { MediaUploader } from "@/components/common/MediaUploader";

export default function UploadStoryPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            router.push("/stories");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Header */}
            <div className="px-4 py-3 sticky top-0 z-30 flex items-center gap-3 bg-gradient-to-b from-black/80 to-transparent">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-bold">New Story</h1>
            </div>

            <form onSubmit={handleUpload} className="p-4 space-y-6 max-w-lg mx-auto flex flex-col h-[80vh] justify-center">
                {/* Media Upload */}
                <div className="flex-1 flex flex-col justify-center">
                    <MediaUploader
                        onFileSelect={(file) => console.log("Selected:", file)}
                        accept="both"
                        label="Upload Story (Video/Photo)"
                    />
                </div>

                <div>
                    <input
                        type="text"
                        className="w-full bg-transparent border-b border-gray-700 px-2 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-lg"
                        placeholder="Add a caption..."
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-auto"
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Upload size={20} />
                            Share Story
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
