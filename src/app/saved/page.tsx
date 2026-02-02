"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { ArrowLeft, Bookmark, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SavedPage() {
    const { t } = useLanguage();

    // Mock Data
    const savedItems = [
        {
            id: '1',
            type: 'article',
            title: 'Organic Farming Guide 101',
            image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=200',
            category: 'Learn'
        },
        {
            id: '2',
            type: 'question',
            title: 'Best fertilizer for Cotton?',
            image: null,
            category: 'Community'
        }
    ];

    const [items, setItems] = useState(savedItems);

    const handleRemove = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-30">
                <Link href="/profile" className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-lg font-bold text-gray-900">{t('menu_saved_items') || 'Saved Items'}</h1>
            </div>

            {/* List */}
            <div className="p-4 flex flex-col gap-3">
                {items.length > 0 ? (
                    items.map((item) => (
                        <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3 relative overflow-hidden">
                            {item.image ? (
                                <div className="w-20 h-20 rounded-lg bg-gray-200 shrink-0">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                                </div>
                            ) : (
                                <div className="w-20 h-20 rounded-lg bg-green-50 shrink-0 flex items-center justify-center text-green-600 font-bold text-xs uppercase text-center p-2">
                                    {item.category}
                                </div>
                            )}

                            <div className="flex-1 py-1 pr-8">
                                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded-full inline-block mb-1">
                                    {item.category}
                                </span>
                                <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{item.title}</h3>
                            </div>

                            <button
                                onClick={() => handleRemove(item.id)}
                                className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Bookmark size={48} className="opacity-20 mb-3" />
                        <p>{t('market_no_results') || 'No saved items'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
