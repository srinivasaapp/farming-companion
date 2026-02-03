"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ArrowRight, Globe, HelpCircle, Tag, BookOpen, Video } from "lucide-react";
import { searchAppContent, SearchResult } from "@/lib/services/search";
import Link from 'next/link';
import { useLanguage } from "@/components/providers/LanguageProvider";

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
    const { t } = useLanguage();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                const res = await searchAppContent(query);
                setResults(res);
                setLoading(false);
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    if (!isOpen) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'question': return <HelpCircle size={16} />;
            case 'listing': return <Tag size={16} />;
            case 'news': return <BookOpen size={16} />;
            case 'story': return <Video size={16} />;
            default: return <Search size={16} />;
        }
    };

    const handleWebSearch = () => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-bottom-10 fade-in duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                <button onClick={onClose} className="p-2 -ml-2 text-gray-500 rounded-full hover:bg-gray-100">
                    <X size={24} />
                </button>
                <div className="flex-1 relative">
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for crops, pests, market prices..."
                        className="w-full bg-gray-50 text-gray-900 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                    {loading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 size={16} className="animate-spin text-gray-400" />
                        </div>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-2">
                {query.length < 2 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-center px-8">
                        <Search size={48} className="opacity-20 mb-4" />
                        <p className="text-sm">Type at least 2 characters to search across the app.</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {/* App Results */}
                        {results.length > 0 && (
                            <div className="mb-4">
                                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    App Results
                                </div>
                                {results.map((item) => (
                                    <Link
                                        key={item.type + item.id}
                                        href={item.url}
                                        onClick={onClose}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                                            ${item.type === 'question' ? 'bg-orange-50 text-orange-600' :
                                                item.type === 'listing' ? 'bg-green-50 text-green-600' :
                                                    item.type === 'news' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                            }`}
                                        >
                                            {getIcon(item.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
                                            <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                                        </div>
                                        <ArrowRight size={16} className="text-gray-300" />
                                    </Link>
                                ))}
                            </div>
                        )}

                        {results.length === 0 && !loading && (
                            <div className="bg-gray-50 rounded-xl p-8 text-center mb-4">
                                <p className="text-sm text-gray-500">No results found in app.</p>
                            </div>
                        )}

                        {/* Global Search Option */}
                        <div className="mt-2">
                            <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Global Search
                            </div>
                            <button
                                onClick={handleWebSearch}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-blue-700">Search Web for "{query}"</h4>
                                    <p className="text-xs text-gray-500">Find external resources, images, and guides</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
