"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2, Video } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { MediaUploader } from "@/components/common/MediaUploader";
import { useToast } from "@/components/providers/ToastProvider";

export default function UploadStoryPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Slides State
    const [slides, setSlides] = useState<{ id: string; file: File | null; caption: string }[]>([
        { id: '1', file: null, caption: '' }
    ]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

    const activeSlide = slides[activeSlideIndex];

    const handleAddSlide = () => {
        setSlides(prev => [...prev, { id: Math.random().toString(), file: null, caption: '' }]);
        setActiveSlideIndex(prev => prev + 1);
    };

    const handleRemoveSlide = (index: number) => {
        if (slides.length <= 1) return;
        setSlides(prev => prev.filter((_, i) => i !== index));
        if (activeSlideIndex >= index && activeSlideIndex > 0) {
            setActiveSlideIndex(prev => prev - 1);
        }
    };

    const updateActiveSlide = (field: 'file' | 'caption', value: any) => {
        setSlides(prev => prev.map((s, i) =>
            i === activeSlideIndex ? { ...s, [field]: value } : s
        ));
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) throw new Error("Login required");

            // 1. Upload all media
            const { uploadImage, createStory } = await import("@/lib/services/api");
            const { compressImage } = await import("@/lib/utils/image");

            const processedSlides = [];

            for (const slide of slides) {
                if (!slide.file) continue; // Skip empty slides? or throw error?

                let mediaUrl;
                let type: 'image' | 'video' = 'image';

                if (slide.file.type.startsWith('image/')) {
                    const compressedFile = await compressImage(slide.file);
                    mediaUrl = await uploadImage(compressedFile, 'stories');
                    type = 'image';
                } else {
                    mediaUrl = await uploadImage(slide.file, 'stories');
                    type = 'video';
                }

                processedSlides.push({
                    url: mediaUrl,
                    type,
                    caption: slide.caption || ''
                });
            }

            if (processedSlides.length === 0) throw new Error("Please add at least one video or photo.");

            // 2. Create Story with JSON src
            // We use JSON.stringify(processedSlides) as the 'src'
            await createStory({
                title: processedSlides[0].caption, // Main title is first caption
                src: JSON.stringify(processedSlides),
                role: user.user_metadata?.role || 'farmer',
                author_id: user.id,
                image_url: processedSlides[0].type === 'image' ? processedSlides[0].url : undefined // Fallback thumbnail if needed
            });

            showToast("Story shared successfully!", "success");
            setTimeout(() => {
                router.push("/stories");
                router.refresh();
            }, 1500);

        } catch (err: any) {
            console.error("Story upload failed", err);
            showToast(err.message || "Failed to post story", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col h-[calc(100dvh-60px)]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 shrink-0 flex items-center justify-between bg-black">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold">New Story</h1>
                        <p className="text-xs text-gray-400">Slide {activeSlideIndex + 1} of {slides.length}</p>
                    </div>
                </div>
                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-full text-sm disabled:opacity-50 flex items-center gap-2"
                >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Share
                </button>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">

                {/* Slide Card */}
                <div className="bg-gray-900/50 rounded-2xl border border-white/10 overflow-hidden flex flex-col flex-1 max-h-[600px] relative">
                    <div className="absolute top-2 right-2 z-10">
                        {slides.length > 1 && (
                            <button
                                onClick={() => handleRemoveSlide(activeSlideIndex)}
                                className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 backdrop-blur-md"
                                title="Remove Slide"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>

                    <div className="flex-1 p-4 flex flex-col justify-center min-h-0">
                        <MediaUploader
                            key={activeSlide.id}
                            onFileSelect={(f) => updateActiveSlide('file', f)}
                            accept="both"
                            label={`Upload Media (${activeSlideIndex + 1})`}
                            initialPreview={activeSlide.file ? URL.createObjectURL(activeSlide.file) : undefined}
                        />
                    </div>

                    <div className="p-4 border-t border-white/10 bg-black/40">
                        <input
                            type="text"
                            className="w-full bg-transparent border-b border-gray-700 px-2 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                            placeholder={`Caption for slide ${activeSlideIndex + 1}...`}
                            value={activeSlide.caption}
                            onChange={(e) => updateActiveSlide('caption', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="border-t border-white/10 p-4 shrink-0 flex items-center gap-4 bg-black safe-area-bottom">
                {/* Page Pagination Dots/Buttons */}
                <div className="flex-1 overflow-x-auto flex gap-2 no-scrollbar">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveSlideIndex(idx)}
                            className={`flex-shrink-0 w-12 h-16 rounded-lg border transition-all overflow-hidden relative ${idx === activeSlideIndex
                                    ? "border-blue-500 opacity-100"
                                    : "border-white/20 opacity-60 hover:opacity-80"
                                }`}
                        >
                            {slides[idx].file ? (
                                slides[idx].file?.type.startsWith('image') ? (
                                    <img src={URL.createObjectURL(slides[idx].file!)} className="w-full h-full object-cover" />
                                ) : (
                                    <video src={URL.createObjectURL(slides[idx].file!)} className="w-full h-full object-cover" />
                                )
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-xs font-bold text-gray-500">
                                    {idx + 1}
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleAddSlide}
                    className="shrink-0 px-4 py-2 bg-gray-800 text-white rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-700"
                >
                    <Upload size={16} className="rotate-90" />
                    Add
                </button>
            </div>
        </div>
    );
}
