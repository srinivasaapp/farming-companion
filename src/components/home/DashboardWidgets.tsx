"use client";

import { CloudSun, TrendingUp, Lightbulb, BookOpen, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
// Remove hardcoded imports if not needed, or keep for fallback
import { getOptimizedImageUrl } from "@/lib/utils/image";
import { useEffect, useState } from "react";
import { getStories } from "@/lib/services/api"; // Import API service

import { useAuth } from "@/components/providers/AuthProvider";

export function DashboardWidgets() {
    const { t } = useLanguage();
    const { user, profile } = useAuth();
    const [stories, setStories] = useState<any[]>([]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('greeting_morning') || "Good Morning";
        if (hour < 18) return t('greeting_afternoon') || "Good Afternoon";
        return t('greeting_evening') || "Good Evening";
    };

    useEffect(() => {
        async function load() {
            try {
                const data = await getStories();
                // Take top 5
                setStories(data.slice(0, 5));
            } catch (err) {
                console.error("Failed to load dashboard stories", err);
            }
        }
        load();
    }, []);

    return (
        <div className="space-y-4">
            {/* Personalization Header */}
            <div className="mb-2">
                <h2 className="text-xl font-bold text-gray-800">
                    {getGreeting()}, <span className="text-green-700">{profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || "Farmer"}</span>
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                    {t('dashboard_welcome_subtitle') || "Ready to grow something great today?"}
                </p>
            </div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('highlights_title')}</h3>

            <div className="grid grid-cols-2 gap-3">
                {/* Learn Highlight */}
                <Link href="/learn" className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:border-green-200 transition-all active:scale-95 hover:shadow-lg hover:-translate-y-1 duration-300">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <Lightbulb size={20} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase mb-1">{t('tip_of_day_title')}</div>
                        <div className="font-semibold text-gray-900 text-sm leading-tight">{t('tip_of_day_desc')}</div>
                    </div>
                </Link>

                {/* Market Highlight */}
                <Link href="/market" className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:border-green-200 transition-all active:scale-95 hover:shadow-lg hover:-translate-y-1 duration-300">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase mb-1">{t('market_trend_title')}</div>
                        <div className="font-semibold text-gray-900 text-sm leading-tight">{t('market_trend_desc')}</div>
                    </div>
                </Link>
            </div>

            {/* Stories Horizontal Scroll Preview */}
            <div className="relative">
                <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
                    {stories.length > 0 ? (
                        stories.map((story) => (
                            <Link
                                key={story.id}
                                href={`/stories/view?id=${story.id}`}
                                className="min-w-[140px] h-[200px] bg-gray-900 rounded-xl relative overflow-hidden snap-start shrink-0"
                            >
                                <img
                                    src={getOptimizedImageUrl(story.src || story.image_url, 200)}
                                    className="w-full h-full object-cover opacity-80"
                                    loading="lazy"
                                    alt={story.title}
                                />
                                <div className="absolute bottom-2 left-2 text-white">
                                    {/* Optional: Add badge if new */}
                                    {/* <div className="bg-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded inline-block mb-1">New</div> */}
                                    <div className="text-xs font-bold leading-tight line-clamp-2">{story.title}</div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        // Fallback Skeuomorph or Skeletal Loading
                        [1, 2].map((i) => (
                            <div key={i} className="min-w-[140px] h-[200px] bg-gray-200 rounded-xl animate-pulse snap-start shrink-0"></div>
                        ))
                    )}

                    <Link href="/stories" className="min-w-[140px] h-[200px] bg-gray-100 rounded-xl relative overflow-hidden snap-start shrink-0 flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <div className="text-gray-400 text-xs font-medium text-center px-4">{t('stories_view_all')}</div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
