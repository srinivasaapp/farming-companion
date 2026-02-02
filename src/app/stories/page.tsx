"use client";

import React, { useState } from "react";
import { FeedHeader, UserRole } from "@/components/common/FeedHeader";
import { GravityStory } from "@/components/ui/GravityStory";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function StoriesPage() {
    const { t } = useLanguage();
    const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);

    const stories = [
        {
            id: 'e1',
            src: "https://assets.mixkit.co/videos/preview/mixkit-wheat-field-in-summer-4357-large.mp4",
            title: "Expert Guide: Wheat Moisture",
            expert: "Dr. Singh",
            role: "expert",
            soil_ph: "6.8 (Optimal)",
            pest_info: "Clear"
        },
        {
            id: 'u1',
            src: "https://assets.mixkit.co/videos/preview/mixkit-hands-planting-a-seed-in-the-ground-5431-large.mp4",
            title: "My Planting Method",
            expert: "Ramesh Farmer",
            role: "farmer",
            soil_ph: "7.1",
            pest_info: "N/A"
        }
    ];

    const filteredItems = selectedRoles.length === 0
        ? stories
        : stories.filter(item => selectedRoles.includes(item.role as UserRole));

    return (
        <div className="flex flex-col h-screen bg-black overflow-hidden pointer-events-auto">
            <FeedHeader
                title={t('nav_stories')}
                uploadPath="/stories/upload"
                selectedRoles={selectedRoles}
                onRoleChange={setSelectedRoles}
            />

            <div className="flex-1 overflow-y-scroll snap-y snap-mandatory scroll-smooth pb-20">
                {filteredItems.map((story) => (
                    <div key={story.id} className="w-full h-full p-2 snap-start flex items-center justify-center">
                        {/* Container for the story card ensures proper spacing */}
                        <GravityStory
                            src={story.src}
                            title={story.title}
                            expert={story.expert}
                            soilPh={story.soil_ph}
                            pestInfo={story.pest_info}
                        />
                    </div>
                ))}

                {/* Spacer at bottom for last item visibility over nav */}
                <div className="h-20 w-full snap-start"></div>
            </div>
        </div>
    );
}
