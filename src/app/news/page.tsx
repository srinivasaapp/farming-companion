"use client";

import React, { useEffect, useState, Suspense } from "react";
import styles from "./page.module.css";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getNewsItem } from "@/lib/services/api";
import { Share2, MessageCircle, ThumbsUp, ArrowLeft, X, Loader2, Calendar } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { shareContent } from "@/lib/utils/share";

// Mock Fallback for invalid IDs
const mockNews = {
    id: 'mock-2',
    type: "news",
    image_url: "https://images.unsplash.com/photo-1625246333195-bf8f85404843?auto=format&fit=crop&q=80&w=800",
    tag: "Subsidy",
    title: "60% Subsidy Launched for Solar Pumps",
    content: [
        "State govt announces new scheme for small and marginal farmers (under 2 acres).",
        "Application window opens Feb 1st at your local Vikas Kendra.",
        "Requires Aadhar card and land ownership proof for verification.",
        "The scheme aims to reduce dependency on diesel pumps and promote sustainable energy.",
        "Interviews with local farmers suggest this will reduce input costs by 30% annually."
    ],
    created_at: new Date().toISOString()
};

function NewsContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const { t } = useLanguage();
    const router = useRouter();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false);

    useEffect(() => {
        async function load() {
            if (!id) {
                setLoading(false);
                return;
            }
            try {
                if (id.startsWith('mock')) {
                    setItem(mockNews);
                } else {
                    const data = await getNewsItem(id);
                    setItem(data);
                }
            } catch (err) {
                console.error("Failed to load news item", err);
                setItem(mockNews);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    const handleShare = async () => {
        if (!item) return;
        await shareContent({
            title: item.title,
            text: `Check out this news: ${item.title}`,
            url: window.location.href,
        });
    };

    const handleLike = () => {
        setLiked(!liked);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-white">
                <Loader2 className="animate-spin text-green-600 mb-2" size={32} />
            </div>
        );
    }

    if (!item) return <div className="p-8 text-center">Item not found</div>;

    return (
        <div className={styles.container}>
            <button className={styles.backBtn} onClick={() => router.back()}>
                <ArrowLeft size={24} />
            </button>

            <div className={styles.hero}>
                <img src={item.image_url || item.image} alt={item.title} className={styles.heroImage} />
                <div className={styles.heroOverlay}>
                    {item.tag && <div className={styles.tags}>{item.tag}</div>}
                    <h1 className={styles.title}>{item.title}</h1>
                    <div className={styles.meta}>
                        <Calendar size={14} />
                        {new Date(item.created_at).toLocaleDateString()}
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                {Array.isArray(item.content) || Array.isArray(item.points) ? (
                    <ul className={styles.bulletList}>
                        {(item.content || item.points).map((point: any, i: number) => (
                            <li key={i} className={styles.bulletItem}>
                                <span className={styles.bulletPoint}></span>
                                {typeof point === 'string' ? point : point.text || JSON.stringify(point)}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>{item.content || item.description || "No content available."}</p>
                )}

                <p className="mt-8 text-sm text-gray-500 italic">
                    Disclaimer: Always verify government schemes with local authorities.
                </p>
            </div>

            <div className={styles.bottomBarWrapper}>
                <div className={styles.bottomBar}>
                    <button className={`${styles.actionBtn} ${liked ? styles.activeLike : ''}`} onClick={handleLike}>
                        <div className={styles.iconContainer}>
                            <ThumbsUp size={24} strokeWidth={2} />
                        </div>
                        <span>{liked ? 'Liked' : 'Like'}</span>
                    </button>

                    <button className={styles.actionBtn} onClick={() => setCommentsOpen(true)}>
                        <div className={styles.iconContainer}>
                            <MessageCircle size={24} strokeWidth={2} />
                        </div>
                        <span>Comment</span>
                    </button>

                    <button className={styles.actionBtn} onClick={handleShare}>
                        <div className={styles.iconContainer}>
                            <Share2 size={24} strokeWidth={2} />
                        </div>
                        <span>Share</span>
                    </button>
                </div>
            </div>

            <div
                className={`${styles.overlay} ${commentsOpen ? styles.overlayVisible : ''}`}
                onClick={() => setCommentsOpen(false)}
            />

            <div className={`${styles.commentsSheet} ${commentsOpen ? styles.commentsOpen : ''}`}>
                <div className={styles.sheetHeader}>
                    <span>Comments (0)</span>
                    <button onClick={() => setCommentsOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                <div className={styles.sheetContent}>
                    <MessageCircle size={48} className="text-gray-300 mb-4" />
                    <p>No comments yet.</p>
                </div>
            </div>
        </div>
    );
}

export default function NewsDetailPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <NewsContent />
        </Suspense>
    );
}
