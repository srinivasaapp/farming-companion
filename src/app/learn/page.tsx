"use client";

import { useState } from "react";
import { FeedHeader, UserRole } from "@/components/common/FeedHeader";
import { AntiGravityCard } from "@/components/ui/AntiGravityCard";
import { Loader2, ThumbsUp, MessageCircle, Share2, Lock } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { CommentSection } from "@/components/feed/CommentSection";
import { shareContent } from "@/lib/utils/share";

export default function LearnPage() {
    const { t } = useLanguage();
    const { user, setShowLoginModal } = useAuth();
    const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
    const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
    const [helpfuls, setHelpfuls] = useState<Record<string, number>>({ 'e1': 24, 'u1': 12 });
    const [isHelpful, setIsHelpful] = useState<Record<string, boolean>>({});

    // Mock Data combined
    // In real app, we would fetch with `in.role` filter
    const articles = [
        {
            id: 'e1',
            type: 'article',
            title: 'Modern Pest Control Techniques',
            image: 'https://images.unsplash.com/photo-1589923188900-85dae5233271?auto=format&fit=crop&q=80&w=800',
            tag: 'Expert Verified',
            role: 'expert',
            points: ['Use pheromone traps', 'Neem oil usage guide']
        },
        {
            id: 'u1',
            type: 'tip',
            title: 'My experience with organic manure',
            image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=800',
            tag: 'Community Tip',
            role: 'farmer',
            points: ['Composting method', 'Results after 2 months']
        }
    ];

    const filteredItems = selectedRoles.length === 0
        ? articles
        : articles.filter(item => selectedRoles.includes(item.role as UserRole));

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
                [itemId]: prev[itemId] + (isHelpful[itemId] ? -1 : 1)
            }));
        }

        if (action === 'comment') {
            setActiveArticleId(activeArticleId === itemId ? null : itemId);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 pb-20">
            <FeedHeader
                title={t('nav_learn')}
                uploadPath="/learn/upload"
                selectedRoles={selectedRoles}
                onRoleChange={setSelectedRoles}
            />

            <div className="flex flex-col gap-3 p-3">
                {filteredItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
                        {item.image && (
                            <div className="h-48 rounded-xl overflow-hidden bg-gray-100 w-full">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${item.role === 'expert' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {item.role === 'expert' ? 'Expert Article' : `${item.role} Post`}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">{item.title}</h2>
                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                {item.role === 'expert'
                                    ? "Learn about the best practices for pest control using organic methods that are safe for your crops and the environment."
                                    : "I tried this method last season and saw a 20% increase in yield. It requires some patience but the results are worth it."}
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-1">
                            <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                                <span className="text-green-600 font-bold">{helpfuls[item.id]}</span> {t('learn_helpful_count')}
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
                ))}
            </div>
        </div>
    );
}
