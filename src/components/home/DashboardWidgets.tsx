"use client";

import { CloudSun, TrendingUp, Lightbulb, BookOpen, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function DashboardWidgets() {
    const { t } = useLanguage();
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('highlights_title')}</h3>

            <div className="grid grid-cols-2 gap-3">
                {/* Learn Highlight */}
                <Link href="/learn" className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:border-green-200 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <Lightbulb size={20} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase mb-1">{t('tip_of_day_title')}</div>
                        <div className="font-semibold text-gray-900 text-sm leading-tight">{t('tip_of_day_desc')}</div>
                    </div>
                </Link>

                {/* Market Highlight */}
                <Link href="/market" className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:border-green-200 transition-colors">
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
                    <Link href="/stories" className="min-w-[140px] h-[200px] bg-gray-900 rounded-xl relative overflow-hidden snap-start shrink-0">
                        <img src="https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-80" />
                        <div className="absolute bottom-2 left-2 text-white">
                            <div className="bg-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded inline-block mb-1">{t('stories_new_badge')}</div>
                            <div className="text-xs font-bold leading-tight">{t('stories_planting_tips')}</div>
                        </div>
                    </Link>
                    <Link href="/stories" className="min-w-[140px] h-[200px] bg-gray-900 rounded-xl relative overflow-hidden snap-start shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10"></div>
                        <img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-80" />
                        <div className="absolute bottom-2 left-2 text-white z-20">
                            <div className="text-xs font-bold leading-tight">{t('stories_harvest_guide')}</div>
                        </div>
                    </Link>
                    <Link href="/stories" className="min-w-[140px] h-[200px] bg-gray-100 rounded-xl relative overflow-hidden snap-start shrink-0 flex items-center justify-center">
                        <div className="text-gray-400 text-xs font-medium text-center px-4">{t('stories_view_all')}</div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
