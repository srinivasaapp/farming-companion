"use client";

import React, { useState, useEffect } from "react";
import { FeedHeader, UserRole } from "@/components/common/FeedHeader";
import { GravityStory } from "@/components/ui/GravityStory";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function StoriesPage() {
    const { t } = useLanguage();
    const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
    const [stories, setStories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStories = async () => {
            try {
                const { getStories } = await import("@/lib/services/api");
                const data = await getStories();
                setStories(data || []);
            } catch (err) {
                console.error("Failed to load stories", err);
            } finally {
                setLoading(false);
            }
        };
        loadStories();
    }, []);

    const filteredItems = selectedRoles.length === 0
        ? stories
        : stories.filter(item => {
            const role = item.profiles?.role || 'farmer';
            return selectedRoles.includes(role as UserRole);
        });

    if (loading) {
        // Black background loading state to match stories theme
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-black overflow-hidden pointer-events-auto">
            <FeedHeader
                title={t('nav_stories')}
                uploadPath="/stories/upload"
                selectedRoles={selectedRoles}
                onRoleChange={setSelectedRoles}
            />

            <div className="flex-1 overflow-y-scroll snap-y snap-mandatory scroll-smooth pb-20">
                {filteredItems.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>{t('market_no_results') || 'No stories yet.'}</p>
                    </div>
                ) : (
                    filteredItems.map((story) => (
                        <div key={story.id} className="w-full h-full p-2 snap-start flex items-center justify-center">
                            {/* Container for the story card ensures proper spacing */}
                            <GravityStory
                                src={story.src || story.image_url} // Fallback to image if src missing
                                title={story.title}
                                expert={story.profiles?.full_name || "Unknown"}
                                soilPh={story.soil_ph || "N/A"}
                                pestInfo={story.pest_info || "N/A"}
                            />
                        </div>
                    ))
                )}

                {/* Spacer at bottom for last item visibility over nav */}
                <div className="h-20 w-full snap-start"></div>
            </div>
        </div>
    );
}
