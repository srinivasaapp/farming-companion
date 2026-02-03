"use client";

import { useState, useEffect } from "react";
import { FeedHeader, UserRole } from "@/components/common/FeedHeader";
import { Loader2, ThumbsUp, MessageCircle, Share2, Trash2, PenSquare, Flag } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { CommentSection } from "@/components/feed/CommentSection";
import { shareContent } from "@/lib/utils/share";
import { getOptimizedImageUrl } from "@/lib/utils/image";
import { useToast } from "@/components/providers/ToastProvider";
import { useRouter } from "next/navigation";
import { ReportModal } from "@/components/common/ReportModal";

// Define Interface for News/Article
interface NewsItem {
    id: string;
    title: string;
    summary?: string;
    content?: string | { text: string } | any[];
    image_url?: string;
    created_at: string;
    author_id: string;
    profile_id?: string; // Add profile_id check
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
    const router = useRouter();
    const { user, profile, setShowLoginModal } = useAuth();
    const { showToast } = useToast();

    const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
    const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
    const [helpfuls, setHelpfuls] = useState<Record<string, number>>({ 'e1': 24, 'u1': 12 });
    const [isHelpful, setIsHelpful] = useState<Record<string, boolean>>({});

    const [articles, setArticles] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
    const [reportTarget, setReportTarget] = useState<string | null>(null);

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

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setArticleToDelete(id);
    };

    const confirmDelete = async () => {
        if (!articleToDelete) return;
        try {
            const { deleteNews } = await import("@/lib/services/api");
            await deleteNews(articleToDelete);

            setArticles(prev => prev.filter(a => a.id !== articleToDelete));
            showToast("Article deleted successfully", "success");
            setArticleToDelete(null);
        } catch (err) {
            console.error("Failed to delete article", err);
            showToast("Failed to delete article", "error");
        }
    };

    const handleEdit = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        router.push(`/learn/upload?edit=${id}`);
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-black text-white items-center justify-center">
                <Loader2 className="animate-spin text-white" size={32} />
                <p className="text-gray-400 mt-2 text-sm">{t('generic_loading')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100dvh-65px)] bg-black overflow-hidden pointer-events-auto">
            <FeedHeader
                title={t('nav_learn')}
                uploadPath="/learn/upload"
                selectedRoles={selectedRoles}
                onRoleChange={setSelectedRoles}
            />

            <div className="flex-1 w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar">
                {filteredItems.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>{t('market_no_results') || 'No articles found.'}</p>
                    </div>
                ) : (
                    filteredItems.map((item) => {
                        const role = item.profiles?.role || 'farmer';
                        const isExpert = role === 'expert';

                        // Check Ownership: user wrote it OR user is admin
                        const isOwner = user && (user.id === item.author_id || user.id === item.profile_id || profile?.role === 'admin');

                        return (
                            <div key={item.id} className="w-full h-full snap-start relative flex flex-col bg-black">
                                {/* Parsing Logic */}
                                {(() => {
                                    let pages: { image_url?: string, text?: string }[] = [];
                                    try {
                                        const contentStr = typeof item.content === 'string' ? item.content : JSON.stringify(item.content || '');

                                        if (contentStr.startsWith('[') || contentStr.startsWith('{')) {
                                            const parsed = JSON.parse(contentStr);
                                            if (Array.isArray(parsed)) {
                                                pages = parsed;
                                            } else {
                                                // Single object or just text wrapped
                                                pages = [{ image_url: item.image_url, text: typeof parsed === 'string' ? parsed : (parsed.text || JSON.stringify(parsed)) }];
                                            }
                                        } else {
                                            // Plain text legacy
                                            pages = [{ image_url: item.image_url, text: contentStr || item.summary || '' }];
                                        }
                                    } catch (e) {
                                        // Fallback on error
                                        const fallbackText = typeof item.content === 'string' ? item.content : (item.summary || '');
                                        pages = [{ image_url: item.image_url, text: fallbackText }];
                                    }

                                    // Fallback if empty
                                    if (pages.length === 0) pages = [{ image_url: item.image_url, text: "No content." }];

                                    return (
                                        <div className="flex-1 w-full h-full overflow-x-scroll snap-x snap-mandatory flex scroll-smooth no-scrollbar">
                                            {pages.map((page, idx) => (
                                                <div key={idx} className="w-full h-full snap-center shrink-0 flex flex-col relative">

                                                    {/* Top Image Section (35%) */}
                                                    <div className="h-[35%] w-full shrink-0 relative bg-gray-900">
                                                        {page.image_url ? (
                                                            <div className="w-full h-full relative">
                                                                <img
                                                                    src={getOptimizedImageUrl(page.image_url, 800)}
                                                                    alt={`${item.title} - Page ${idx + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                    loading="lazy"
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-green-900 to-black flex items-center justify-center">
                                                                <span className="text-white/20 text-4xl font-bold tracking-wider">Learn</span>
                                                            </div>
                                                        )}

                                                        {/* Page Indicator (if multiple) */}
                                                        {pages.length > 1 && (
                                                            <div className="absolute top-4 left-4 z-20 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white font-medium border border-white/10">
                                                                {idx + 1} / {pages.length}
                                                            </div>
                                                        )}

                                                        {/* Owner Actions (Visible on every slide currently, or just first? Up to logic. Keeping on every for ease of access) */}
                                                        {isOwner && (
                                                            <div className="absolute top-4 right-4 flex flex-col gap-3 z-20">
                                                                <button
                                                                    onClick={(e) => handleEdit(e, item.id)}
                                                                    className="p-2.5 bg-black/40 text-white hover:bg-white/20 backdrop-blur-md rounded-full transition-all border border-white/10"
                                                                    title="Edit"
                                                                >
                                                                    <PenSquare size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => handleDeleteClick(e, item.id)}
                                                                    className="p-2.5 bg-red-600/80 text-white hover:bg-red-700 backdrop-blur-md rounded-full transition-all border border-red-500/50"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Bottom Section (65%) */}
                                                    <div className="flex-1 flex flex-col bg-gray-900 rounded-t-[2rem] -mt-6 z-10 px-6 pt-8 pb-4 border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden">
                                                        {/* Scrollable Text Area */}
                                                        <div className="flex-1 overflow-y-auto no-scrollbar pb-4 space-y-4">
                                                            {idx === 0 && (
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${isExpert ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                                                                        {isExpert ? 'Expert' : role}
                                                                    </span>
                                                                    <span className="text-gray-400 text-xs flex items-center gap-1">
                                                                        • {new Date(item.created_at).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            <h2 className="text-xl font-bold text-white leading-tight">{item.title}</h2>

                                                            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                                                {safeRender(page.text)}
                                                            </div>
                                                        </div>

                                                        {/* Fixed Bottom Action Bar */}
                                                        <div className="shrink-0 pt-4 mt-2 border-t border-white/10">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                                                                    <span className="text-green-400 font-bold text-sm">{helpfuls[item.id] || 0}</span> helpful
                                                                </div>
                                                                <div className="flex items-center gap-6">
                                                                    <button
                                                                        className={`flex flex-col items-center gap-1 transition-colors ${isHelpful[item.id] ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
                                                                        onClick={() => handleInteraction('helpful', item.id)}
                                                                    >
                                                                        <ThumbsUp size={22} fill={isHelpful[item.id] ? "currentColor" : "none"} />
                                                                    </button>

                                                                    <button
                                                                        className={`flex flex-col items-center gap-1 transition-colors ${activeArticleId === item.id ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
                                                                        onClick={() => handleInteraction('comment', item.id)}
                                                                    >
                                                                        <MessageCircle size={22} />
                                                                    </button>

                                                                    <button
                                                                        className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
                                                                        onClick={() => handleInteraction('share', item.id)}
                                                                    >
                                                                        <Share2 size={22} />
                                                                    </button>

                                                                    <button
                                                                        className="flex flex-col items-center gap-1 text-gray-400 hover:text-red-400 transition-colors"
                                                                        onClick={() => setReportTarget(item.id)}
                                                                    >
                                                                        <Flag size={22} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}

                                {/* Comments Drawer (conditional) */}
                                {activeArticleId === item.id && (
                                    <div className="absolute inset-0 z-30 flex flex-col" onClick={() => setActiveArticleId(null)}>
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                                        <div className="relative mt-auto h-[70%] bg-white rounded-t-3xl flex flex-col animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-center p-3 border-b border-gray-100/50">
                                                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4">
                                                <CommentSection postId={item.id} authorId={item.author_id} postType="news" />
                                            </div>
                                            <button
                                                onClick={() => setActiveArticleId(null)}
                                                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
                                            >
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {articleToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden scale-100">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Article?</h3>
                            <p className="text-gray-500 text-sm">
                                Are you sure you want to delete this article? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex border-t border-gray-100">
                            <button
                                onClick={() => setArticleToDelete(null)}
                                className="flex-1 py-4 text-gray-600 font-bold hover:bg-gray-50 active:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <div className="w-px bg-gray-100"></div>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-4 text-red-600 font-bold hover:bg-red-50 active:bg-red-100 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ReportModal
                isOpen={!!reportTarget}
                onClose={() => setReportTarget(null)}
                targetId={reportTarget || ""}
                targetType="news"
            />
        </div>
    );
}
