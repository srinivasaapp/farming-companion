"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getNews } from "@/lib/services/api";
import { Loader2, ArrowLeft, Calendar, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FeedHeader } from "@/components/common/FeedHeader";

export default function NewsListPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [newsList, setNewsList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getNews();
                setNewsList(data);
            } catch (err) {
                console.error("Failed to load news", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <Loader2 className="animate-spin text-green-600" size={32} />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-black overflow-hidden relative">
            {/* Header - Fixed at top */}
            <div className="absolute top-0 left-0 right-0 z-50">
                <FeedHeader
                    title={t('nav_news') || "News & Updates"}
                    uploadPath="/news/upload" // Assuming upload path exists or will exist
                    selectedRoles={[]}
                    onRoleChange={() => { }}
                />
            </div>

            <div className="flex-1 overflow-y-scroll snap-y snap-mandatory scroll-smooth pb-[0px]">
                {newsList.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>{t('market_no_results') || "No news available."}</p>
                    </div>
                ) : (
                    newsList.map((item) => (
                        <div
                            key={item.id}
                            className="w-full h-full snap-start relative flex flex-col justify-end group border-b border-white/5"
                        >
                            {/* Background Image - Full Screen */}
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={item.image_url || item.image || "https://via.placeholder.com/400x800"}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                {/* Gradient Overlay for text readability */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent via-60% to-black/90" />
                            </div>

                            {/* Content Overlay */}
                            <div className="relative z-10 p-6 pb-24 flex flex-col gap-3">
                                {/* Tag / Badge */}
                                {item.tag && (
                                    <span className="self-start bg-green-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                        {item.tag}
                                    </span>
                                )}

                                {/* Title */}
                                <h2 className="text-2xl font-bold text-white leading-tight drop-shadow-md">
                                    {item.title}
                                </h2>

                                {/* Meta Info */}
                                <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                                    <Calendar size={14} />
                                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                </div>

                                {/* Summary */}
                                <p className="text-gray-200 text-sm line-clamp-3 leading-relaxed drop-shadow-sm">
                                    {item.summary || (Array.isArray(item.content) ? item.content[0] : item.content)}
                                </p>

                                {/* Action Button */}
                                <Link
                                    href={`/news/view?id=${item.id}`}
                                    className="mt-2 self-start flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white px-5 py-2.5 rounded-xl font-semibold transition-all"
                                >
                                    Read Full Story <ChevronRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
