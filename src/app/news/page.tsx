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
        <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
            {/* Header */}
            <div className="bg-white sticky top-0 z-30 border-b border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
                <button onClick={() => router.back()} className="text-gray-600">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-gray-900">{t('nav_news') || "News & Updates"}</h1>
            </div>

            <div className="p-4 space-y-4">
                {newsList.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        {t('market_no_results') || "No news available."}
                    </div>
                ) : (
                    newsList.map((item) => (
                        <Link
                            href={`/news/view?id=${item.id}`}
                            key={item.id}
                            className="block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <div className="aspect-video w-full bg-gray-100 relative">
                                <img
                                    src={item.image_url || item.image || "https://via.placeholder.com/400x200"}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                {item.tag && (
                                    <span className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                        {item.tag}
                                    </span>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex items-center gap-2 text-gray-400 mb-2">
                                    <Calendar size={12} />
                                    <span className="text-xs font-medium">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                    {item.summary || (Array.isArray(item.content) ? item.content[0] : item.content)}
                                </p>
                                <div className="mt-3 flex items-center text-green-600 text-sm font-semibold">
                                    Read More <ChevronRight size={16} />
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
