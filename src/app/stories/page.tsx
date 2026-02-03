"use client";

import React, { useState, useEffect } from "react";
import { FeedHeader, UserRole } from "@/components/common/FeedHeader";
import { GravityStory } from "@/components/ui/GravityStory";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Trash2 } from "lucide-react";

export default function StoriesPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
    const [stories, setStories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    const [storyToDelete, setStoryToDelete] = useState<string | null>(null);

    // Load Stories
    useEffect(() => {
        const loadStories = async () => {
            try {
                const { getStories } = await import("@/lib/services/api");
                const data = await getStories();
                setStories(data || []);
            } catch (err) {
                console.error("Failed to load stories", err);
            } finally {
                setLoading(false);
            }
        };
        loadStories();
    }, []);

    // Initialize Active Story on load
    useEffect(() => {
        if (!loading && stories.length > 0 && !activeStoryId) {
            setActiveStoryId(stories[0].id);
        }
    }, [loading, stories, activeStoryId]);

    // Reset slide index when changing stories
    useEffect(() => {
        setCurrentSlideIndex(0);
    }, [activeStoryId]);

    // Intersection Observer to track active story
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const newId = entry.target.getAttribute('data-story-id');
                        if (newId && newId !== activeStoryId) {
                            setActiveStoryId(newId);
                        }
                    }
                });
            },
            {
                threshold: 0.6, // 60% visibility required to be "active"
                root: null, // viewport
            }
        );

        const storyElements = document.querySelectorAll('.story-container');
        storyElements.forEach((el) => observer.observe(el));

        return () => {
            storyElements.forEach((el) => observer.unobserve(el));
            observer.disconnect();
        };
    }, [stories, loading]);

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setStoryToDelete(id);
    };

    const confirmDelete = async () => {
        if (!storyToDelete) return;
        try {
            const { deleteStory } = await import("@/lib/services/api");
            await deleteStory(storyToDelete);
            setStories(prev => prev.filter(s => s.id !== storyToDelete));
            setStoryToDelete(null);
            showToast("Story deleted", "success");
        } catch (err) {
            console.error("Failed to delete", err);
            showToast("Failed to delete", "error");
        }
    };

    const cancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setStoryToDelete(null);
    };

    const filteredItems = selectedRoles.length === 0
        ? stories
        : stories.filter(item => {
            const role = item.profiles?.role || 'farmer';
            return selectedRoles.includes(role as UserRole);
        });

    if (loading) {
        // Black background loading state to match stories theme
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100dvh-65px)] bg-black overflow-hidden pointer-events-auto">
            <FeedHeader
                title={t('nav_stories')}
                uploadPath="/stories/upload"
                selectedRoles={selectedRoles}
                onRoleChange={setSelectedRoles}
            />

            <div className="flex-1 w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar">
                {filteredItems.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>{t('market_no_results') || 'No stories yet.'}</p>
                    </div>
                ) : (
                    filteredItems.map((item) => {
                        const isOwner = user && (user.id === item.profile_id); // Changed from author_id to profile_id
                        const isActive = activeStoryId === item.id;

                        // Parse Slides
                        let slides: { url: string, type: 'image' | 'video', caption?: string }[] = [];
                        try {
                            if (item.src && (item.src.startsWith('[') || item.src.startsWith('{'))) {
                                const parsed = JSON.parse(item.src);
                                slides = Array.isArray(parsed) ? parsed : [parsed];
                            } else {
                                slides = [{ url: item.src, type: 'video', caption: item.title }];
                            }
                        } catch (e) {
                            slides = [{ url: item.src, type: 'video', caption: item.title }];
                        }

                        return (
                            <div
                                key={item.id}
                                data-story-id={item.id}
                                className="story-container w-full h-full p-2 snap-center flex items-center justify-center relative group"
                            >
                                {/* Horizontal Carousel */}
                                <div
                                    className="w-full h-full flex overflow-x-scroll snap-x snap-mandatory no-scrollbar"
                                    onScroll={(e) => {
                                        if (!isActive) return;
                                        const el = e.currentTarget;
                                        const index = Math.round(el.scrollLeft / el.clientWidth);
                                        if (index !== currentSlideIndex) setCurrentSlideIndex(index);
                                    }}
                                >
                                    {slides.map((slide, idx) => {
                                        const isSlideActive = isActive && currentSlideIndex === idx;

                                        return (
                                            <div key={idx} className="w-full h-full snap-center shrink-0 relative bg-black">
                                                {slide.type === 'image' ? (
                                                    <div className="w-full h-full relative">
                                                        <img
                                                            src={slide.url}
                                                            alt={slide.caption || item.title}
                                                            className="w-full h-full object-contain"
                                                        />
                                                        {/* Caption Overlay for Image */}
                                                        <div className="absolute bottom-0 left-0 right-0 p-4 pt-20 bg-gradient-to-t from-black/90 to-transparent">
                                                            <h2 className="text-white font-bold text-lg">{slide.caption || item.title}</h2>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <GravityStory
                                                        src={slide.url}
                                                        title={slide.caption || item.title}
                                                        expert={(item.profiles as any)?.full_name || 'Farmer'}
                                                        isActive={isSlideActive}
                                                    />
                                                )}

                                                {/* Global Slide Indicator */}
                                                {slides.length > 1 && (
                                                    <div className="absolute top-4 right-4 z-40 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full text-[10px] text-white font-bold border border-white/10">
                                                        {idx + 1}/{slides.length}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Delete/Owner Controls (Absolute to the whole Story ROW, not slide) */}
                                {isOwner && (
                                    <button
                                        onClick={(e) => handleDeleteClick(e, item.id)}
                                        className="absolute top-16 right-4 z-50 p-2 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-full backdrop-blur-md transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}

                {/* Spacer at bottom for last item visibility over nav */}
                <div className="h-20 w-full snap-start"></div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {storyToDelete && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 w-[85%] max-w-sm shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Story?</h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            Are you sure you want to delete this story? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelDelete}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
