"use client";

import React, { Suspense, useEffect, useState } from "react";
import { GravityStory } from "@/components/ui/GravityStory";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getStories } from "@/lib/services/api";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function StoryDetailContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const { t } = useLanguage();
    const router = useRouter();
    const [story, setStory] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                if (!id) {
                    setLoading(false);
                    return;
                }
                const stories = await getStories();
                const found = stories.find((s: any) => s.id === id);
                setStory(found);
            } catch (err) {
                console.error("Failed to load story", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    if (!story) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black text-white gap-4">
                <p>Story not found</p>
                <button onClick={() => router.back()} className="text-sm underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-black relative">
            <button
                onClick={() => router.back()}
                className="absolute top-4 left-4 z-50 p-2 bg-black/20 backdrop-blur-md rounded-full text-white"
            >
                <ArrowLeft size={24} />
            </button>
            <GravityStory
                src={story.src || story.image_url}
                title={story.title}
                expert={story.profiles?.full_name || "Unknown"}
                soilPh={story.soil_ph || "N/A"}
                pestInfo={story.pest_info || "N/A"}
                isActive={true} // Always active on detail page
            />
        </div>
    );
}

export default function StoryDetailPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-black"><Loader2 className="animate-spin text-white" /></div>}>
            <StoryDetailContent />
        </Suspense>
    );
}
