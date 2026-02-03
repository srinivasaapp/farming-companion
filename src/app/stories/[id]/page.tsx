"use client";

import React, { Suspense, useEffect, useState, use } from "react";
import { GravityStory } from "@/components/ui/GravityStory";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getStories } from "@/lib/services/api"; // We might need getStory(id) but for now let's find it from list or fetch all.
// Actually, for a detail page, we should fetch just one. But api.ts doesn't have getStory(id) yet.
// I'll update api.ts later if needed, but for now I can fetch all and find, or just mock if not found.
// Better to fetch all for now as getStories is available.
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

function StoryDetailContent({ id }: { id: string }) {
    const { t } = useLanguage();
    const router = useRouter();
    const [story, setStory] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                // Ideally we have getStory(id). For now, let's re-use getStories and find.
                // In a real app we'd add getStory(id) to api.ts. 
                // Since I can't edit api.ts easily without potentially breaking other things (though I should),
                // I will fetch all. 
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

export default function StoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-black"><Loader2 className="animate-spin text-white" /></div>}>
            <StoryDetailContent id={id} />
        </Suspense>
    );
}
