"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { MediaUploader } from "@/components/common/MediaUploader";

export default function UploadNewsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Metadata
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Information");

    // Pages State
    const [pages, setPages] = useState<{ id: string; file: File | null; content: string }[]>([
        { id: '1', file: null, content: '' }
    ]);
    const [activePageIndex, setActivePageIndex] = useState(0);

    const activePage = pages[activePageIndex];

    const handleAddPage = () => {
        setPages(prev => [...prev, { id: Math.random().toString(), file: null, content: '' }]);
        setActivePageIndex(prev => prev + 1);
    };

    const handleRemovePage = (index: number) => {
        if (pages.length <= 1) return;
        setPages(prev => prev.filter((_, i) => i !== index));
        if (activePageIndex >= index && activePageIndex > 0) {
            setActivePageIndex(prev => prev - 1);
        }
    };

    const updateActivePage = (field: 'file' | 'content', value: any) => {
        setPages(prev => prev.map((p, i) =>
            i === activePageIndex ? { ...p, [field]: value } : p
        ));
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) throw new Error("You must be logged in to post news.");

            // 1. Upload all images
            const { uploadImage, createNews } = await import("@/lib/services/api");
            const { compressImage } = await import("@/lib/utils/image");

            const processedPages = [];
            let coverImageUrl = undefined;

            for (let i = 0; i < pages.length; i++) {
                const p = pages[i];
                let uploadedUrl = undefined;

                if (p.file) {
                    const compressed = await compressImage(p.file);
                    uploadedUrl = await uploadImage(compressed, 'news');
                }

                if (i === 0) coverImageUrl = uploadedUrl;

                processedPages.push({
                    text: p.content,
                    image_url: uploadedUrl
                });
            }

            // 2. Create News with JSON content
            // We use the first page's text as the 'summary' field for legacy support / SEO
            const summary = processedPages[0].text.substring(0, 150) + (processedPages[0].text.length > 150 ? '...' : '');

            await createNews({
                title,
                summary: summary, // Auto-generated summary from first page
                content: JSON.stringify(processedPages), // Store full carousel here
                image_url: coverImageUrl, // Cover image
                author_id: user.id
            });

            showToast("Carousel published successfully!", "success");
            setTimeout(() => {
                router.push("/learn");
                router.refresh();
            }, 1500);

        } catch (err: any) {
            console.error("Upload failed", err);
            showToast(err.message || "Failed to upload", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col h-[calc(100dvh-60px)]">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Create Carousel</h1>
                        <p className="text-xs text-gray-500">Page {activePageIndex + 1} of {pages.length}</p>
                    </div>
                </div>
                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white font-bold rounded-full text-sm disabled:opacity-50 flex items-center gap-2"
                >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Publish
                </button>
            </div>

            {/* Main Editor Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Global Title */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Headline</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-bold text-lg"
                        placeholder="Main Title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* Page Editor */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase">Slide {activePageIndex + 1} Content</span>
                        {pages.length > 1 && (
                            <button onClick={() => handleRemovePage(activePageIndex)} className="text-red-500 text-xs font-bold hover:underline">
                                Remove Slide
                            </button>
                        )}
                    </div>

                    <div className="p-4 space-y-4">
                        <MediaUploader
                            key={activePage.id} // Force reset on page change
                            onFileSelect={(f) => updateActivePage('file', f)}
                            accept="image" // Limiting to images for carousel simple MVP
                            label={`Image for Slide ${activePageIndex + 1}`}
                            initialPreview={activePage.file ? URL.createObjectURL(activePage.file) : undefined}
                        />

                        <textarea
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 h-40 resize-none"
                            placeholder={`Write content for slide ${activePageIndex + 1}...`}
                            value={activePage.content}
                            onChange={(e) => updateActivePage('content', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="bg-white border-t border-gray-100 p-4 shrink-0 flex items-center gap-4 safe-area-bottom">

                {/* Page Pagination Dots/Buttons */}
                <div className="flex-1 overflow-x-auto flex gap-2 no-scrollbar">
                    {pages.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActivePageIndex(idx)}
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors ${idx === activePageIndex
                                    ? "bg-green-600 text-white border-green-600"
                                    : "bg-white text-gray-500 border-gray-200 hover:border-green-400"
                                }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleAddPage}
                    className="shrink-0 px-4 py-2 bg-black text-white rounded-lg font-bold text-sm flex items-center gap-2"
                >
                    <Upload size={16} className="rotate-90" /> {/* Reuse icon roughly looking like plus or add */}
                    Add Slide
                </button>
            </div>
        </div>
    );
}
