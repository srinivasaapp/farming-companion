"use client";

import React, { useState } from "react";
import { TopTabNav } from "@/components/common/TopTabNav";
import { GravityStory } from "@/components/ui/GravityStory";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function StoriesPage() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'expert' | 'user'>('expert');

    const expertStories = [
        {
            id: 'e1',
            src: "https://assets.mixkit.co/videos/preview/mixkit-wheat-field-in-summer-4357-large.mp4",
            title: "Expert Guide: Wheat Moisture",
            expert: "Dr. Singh",
            soil_ph: "6.8 (Optimal)",
            pest_info: "Clear"
        }
    ];

    const userStories = [
        {
            id: 'u1',
            src: "https://assets.mixkit.co/videos/preview/mixkit-hands-planting-a-seed-in-the-ground-5431-large.mp4",
            title: "My Planting Method",
            expert: "Ramesh Farmer",
            soil_ph: "7.1",
            pest_info: "N/A"
        }
    ];

    const items = activeTab === 'expert' ? expertStories : userStories;

    return (
        <div className="flex flex-col h-screen bg-black overflow-hidden">
            <TopTabNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onExpertAdd={() => alert("Upload Expert Story")}
                onUserAdd={() => alert("Upload User Story")}
            />

            <div className="flex-1 overflow-y-scroll snap-y snap-mandatory scroll-smooth pb-20">
                {items.map((story) => (
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
