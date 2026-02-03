"use client";

import { useState, useEffect } from "react";
import { FeedHeader, UserRole } from "@/components/common/FeedHeader";
import { AntiGravityCard } from "@/components/ui/AntiGravityCard";
import { Loader2, ThumbsUp, MessageCircle, Share2, Lock, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { CommentSection } from "@/components/feed/CommentSection";
import { shareContent } from "@/lib/utils/share";
import { getOptimizedImageUrl } from "@/lib/utils/image";

// Define Interface for News/Article
interface NewsItem {
    id: string;
    title: string;
    summary?: string;
    content?: string | { text: string } | any[];
    image_url?: string;
    created_at: string;
    author_id: string;
    profiles?: {
        full_name: string;
        username: string;
        role: string;
    };
}

const safeRender = (content: any): React.ReactNode => {
    if (!content) return "";

    // 1. Array handling
    if (Array.isArray(content)) {
        return content.map((block: any, index: number) => {
            if (block && typeof block === 'object' && 'text' in block && typeof block.text === 'string') {
                return (
                    <span key={index} className="block mb-2">
                        {block.text}
                    </span>
                );
            }
            return (
                <span key={index} className="block mb-2 text-xs text-gray-500 font-mono">
                    {typeof block === 'string' ? block : JSON.stringify(block)}
                </span>
            );
        });
    }

    // 2. Handle Single Object
    if (typeof content === 'object') {
        if ('text' in content && typeof content.text === 'string') {
            return content.text;
        }
        return JSON.stringify(content);
    }

    // 3. Handle String (check for JSON)
    if (typeof content === 'string') {
        const trimmed = content.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            try {
                const parsed = JSON.parse(content);
                return safeRender(parsed);
            } catch (e) {
                return content;
            }
        }
        return content;
    }

    return String(content);
};

export default function LearnPage() {
    const { t } = useLanguage();
    const { user, setShowLoginModal } = useAuth();
    const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
    const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
    const [helpfuls, setHelpfuls] = useState<Record<string, number>>({ 'e1': 24, 'u1': 12 });
    const [isHelpful, setIsHelpful] = useState<Record<string, boolean>>({});

    const [articles, setArticles] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNews = async () => {
            try {
                const { getNews } = await import("@/lib/services/api");
                const data = await getNews();
                setArticles(data || []);
            } catch (err) {
                console.error("Failed to load news", err);
            } finally {
                setLoading(false);
            }
        };
        loadNews();
    }, []);

    const filteredItems = selectedRoles.length === 0
        ? articles
        : articles.filter(item => {
            // Mapped role from profile if available, else default to 'farmer'
            const role = item.profiles?.role || 'farmer';
            return selectedRoles.includes(role as UserRole);
        });

    const handleInteraction = async (action: 'helpful' | 'comment' | 'share', itemId: string) => {
        if (action === 'share') {
            const item = articles.find(i => i.id === itemId);
            if (item) {
                await shareContent({
                    title: item.title,
                    text: `Check out this article: ${item.title}`,
                    url: window.location.href
                });
            }
            return;
        }

        if (!user) {
            setShowLoginModal(true);
            return;
        }

        if (action === 'helpful') {
            setIsHelpful(prev => ({ ...prev, [itemId]: !prev[itemId] }));
            setHelpfuls(prev => ({
                ...prev,
                [itemId]: (prev[itemId] || 0) + (isHelpful[itemId] ? -1 : 1)
            }));
        }

        if (action === 'comment') {
            setActiveArticleId(activeArticleId === itemId ? null : itemId);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-100 pb-20 items-center justify-center">
                <Loader2 className="animate-spin text-green-600" size={32} />
                <p className="text-gray-500 mt-2 text-sm">{t('generic_loading')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 pb-20">
            <FeedHeader
                title={t('nav_learn')}
                uploadPath="/learn/upload"
                selectedRoles={selectedRoles}
                onRoleChange={setSelectedRoles}
            />

            <div className="flex flex-col gap-3 p-3">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p>{t('market_no_results') || 'No articles found.'}</p>
                    </div>
                ) : (
                    filteredItems.map((item) => {
                        const role = item.profiles?.role || 'farmer';
                        const isExpert = role === 'expert';

                        return (
                            <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
                                {item.image_url && (
                                    <div className="h-48 rounded-xl overflow-hidden bg-gray-100 w-full">
                                        <img
                                            src={getOptimizedImageUrl(item.image_url, 600)}
                                            alt={item.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${isExpert ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {isExpert ? 'Expert Article' : `${role} Post`}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">{item.title}</h2>
                                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                        {safeRender(item.summary || item.content)}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-1">
                                    <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                                        <span className="text-green-600 font-bold">{helpfuls[item.id] || 0}</span> {t('learn_helpful_count')}
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${isHelpful[item.id] ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                                }`}
                                            onClick={() => handleInteraction('helpful', item.id)}
                                        >
                                            <ThumbsUp size={16} fill={isHelpful[item.id] ? "currentColor" : "none"} />
                                            <span className="text-xs font-bold">{t('learn_action_helpful')}</span>
                                        </button>

                                        <button
                                            className={`p-2 rounded-full transition-colors ${activeArticleId === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                                            onClick={() => handleInteraction('comment', item.id)}
                                        >
                                            <MessageCircle size={18} />
                                        </button>

                                        <button
                                            className="p-2 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                                            onClick={() => handleInteraction('share', item.id)}
                                        >
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Comments Section */}
                                {activeArticleId === item.id && (
                                    <div className="pt-2 animate-in slide-in-from-top duration-200">
                                        <CommentSection postId={item.id} />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
