"use client";

import React, { useRef, useState, useEffect } from "react";
import { ThumbsUp, MessageCircle, Share2, Volume2, VolumeX } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { CommentSection } from "@/components/feed/CommentSection";
import { shareContent } from "@/lib/utils/share";
import { useAuth } from "@/components/providers/AuthProvider";

interface StoryProps {
    src: string;
    title: string;
    expert: string;
    soilPh?: string;
    pestInfo?: string;
    isActive: boolean;
}

export function GravityStory({ src, title, expert, soilPh, pestInfo, isActive }: StoryProps) {
    const { t } = useLanguage();
    const { user, setShowLoginModal } = useAuth();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        if (videoRef.current) {
            if (isActive) {
                // Reset to beginning if it ended? Or just play.
                // Usually shorts resume.
                const playPromise = videoRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Auto-play prevented:", error);
                    });
                }
            } else {
                videoRef.current.pause();
                // Optional: videoRef.current.currentTime = 0; // if we want to reset
            }
        }
    }, [isActive]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) videoRef.current.play();
            else videoRef.current.pause();
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        setLikes(prev => isLiked ? prev - 1 : prev + 1);
        setIsLiked(!isLiked);
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await shareContent({
            title: title,
            text: `Watch this story by ${expert}: ${title}`,
            url: window.location.href
        });
    };

    const [showComments, setShowComments] = useState(false);

    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black mx-0 my-0 snap-start shrink-0" onClick={togglePlay}>
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain bg-black"
                loop
                muted={isMuted}
                playsInline
            />

            {/* Top Controls */}
            <div className="absolute top-4 right-4 z-10">
                <button onClick={toggleMute} className="bg-black/20 backdrop-blur-md p-2 rounded-full text-white/90">
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            {/* Right Side Actions Stack */}
            <div className="absolute bottom-20 right-2 flex flex-col gap-6 z-20 items-center">
                <button className="flex flex-col items-center gap-1 text-white shadow-sm" onClick={handleLike}>
                    <div className={`p-3 rounded-full ${isLiked ? 'bg-green-500 text-white' : 'bg-black/30 backdrop-blur-sm'}`}>
                        <ThumbsUp size={24} fill={isLiked ? "currentColor" : "none"} />
                    </div>
                    <span className="text-xs font-medium drop-shadow-md">{likes > 0 ? likes : t('story_action_useful')}</span>
                </button>
                <button
                    className="flex flex-col items-center gap-1 text-white shadow-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!user) {
                            setShowLoginModal(true);
                            return;
                        }
                        setShowComments(true);
                    }}
                >
                    <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                        <MessageCircle size={24} />
                    </div>
                    <span className="text-xs font-medium drop-shadow-md">{t('story_action_chat')}</span>
                </button>
                <button
                    className="flex flex-col items-center gap-1 text-white shadow-sm"
                    onClick={handleShare}
                >
                    <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                        <Share2 size={24} />
                    </div>
                    <span className="text-xs font-medium drop-shadow-md">{t('story_action_share')}</span>
                </button>
            </div>

            {/* Bottom Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-32 pb-6">
                <div className="max-w-[80%]">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">
                            {expert.charAt(0)}
                        </div>
                        <span className="text-white font-semibold text-sm shadow-black drop-shadow-md">{expert}</span>
                        <span className="bg-white/20 backdrop-blur-md text-white/90 text-[10px] px-2 py-0.5 rounded-full border border-white/10">{t('story_badge_expert')}</span>
                    </div>
                    <h2 className="text-white font-bold text-lg leading-snug drop-shadow-lg mb-1">{title}</h2>
                    <p className="text-white/80 text-sm line-clamp-2 drop-shadow-md mb-2">
                        This is a sample description for the story. Swipe up to see more tips and tricks for better yield.
                    </p>
                    <div className="flex gap-2">
                        {soilPh && (
                            <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10 flex flex-col">
                                <span className="text-[10px] text-gray-300 uppercase font-bold">Soil pH</span>
                                <span className="text-xs text-white font-medium">{soilPh}</span>
                            </div>
                        )}
                        {pestInfo && (
                            <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10 flex flex-col">
                                <span className="text-[10px] text-red-300 uppercase font-bold">Pest Alert</span>
                                <span className="text-xs text-white font-medium">{pestInfo}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Comments Bottom Sheet */}
            {showComments && (
                <div className="absolute inset-0 z-50 flex flex-col justify-end" onClick={(e) => e.stopPropagation()}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={() => setShowComments(false)} />
                    <div className="relative bg-white rounded-t-3xl h-[60%] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-center pt-3 pb-2 border-b border-gray-100 shrink-0">
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 pb-20">
                            <CommentSection postId="story-demo" postType="story" />
                        </div>
                        <button
                            onClick={() => setShowComments(false)}
                            className="absolute top-3 right-4 p-1 text-gray-400"
                        >
                            <span className="sr-only">Close</span>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
