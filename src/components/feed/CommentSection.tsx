"use client";

import React, { useState } from "react";
import { Mic, Image as ImageIcon, Send, ThumbsUp, MessageCircle, X, Reply } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Comment {
    id: string;
    author: string;
    avatar: string;
    text?: string;
    audioUrl?: string; // Simulator
    imageUrl?: string;
    likes: number;
    replies: Comment[];
    isLiked?: boolean;
    timestamp: string;
}

interface CommentSectionProps {
    postId: string;
    startOpen?: boolean; // For initial load state if needed
}

export function CommentSection({ postId }: CommentSectionProps) {
    const { t } = useLanguage();
    const [comments, setComments] = useState<Comment[]>([
        {
            id: 'c1',
            author: 'Ravi Kumar',
            avatar: 'R',
            text: 'This is very helpful info! Thanks.',
            likes: 12,
            replies: [],
            timestamp: '2h'
        },
        {
            id: 'c2',
            author: 'Anitha',
            avatar: 'A',
            text: 'Can you share more about the fertilizer used?',
            likes: 5,
            timestamp: '5h',
            replies: [
                {
                    id: 'c2-r1',
                    author: 'Expert Singh',
                    avatar: 'E',
                    text: 'We used NPK 20-20-20 for this stage.',
                    likes: 8,
                    replies: [],
                    timestamp: '1h'
                }
            ]
        }
    ]);

    const [newComment, setNewComment] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const handleSend = () => {
        if (!newComment.trim() && !isRecording) return;

        const newMsg: Comment = {
            id: Date.now().toString(),
            author: 'You',
            avatar: 'Y',
            text: newComment,
            likes: 0,
            replies: [],
            timestamp: 'Just now'
        };

        if (replyingTo) {
            setComments(prev => prev.map(c => {
                if (c.id === replyingTo) {
                    return { ...c, replies: [...c.replies, newMsg] };
                }
                return c;
            }));
            setReplyingTo(null);
        } else {
            setComments(prev => [newMsg, ...prev]);
        }
        setNewComment("");
        setIsRecording(false);
    };

    const toggleLike = (id: string, isReply = false, parentId?: string) => {
        if (isReply && parentId) {
            setComments(prev => prev.map(c => {
                if (c.id === parentId) {
                    return {
                        ...c,
                        replies: c.replies.map(r => r.id === id ? { ...r, likes: r.likes + (r.isLiked ? -1 : 1), isLiked: !r.isLiked } : r)
                    };
                }
                return c;
            }));
        } else {
            setComments(prev => prev.map(c => c.id === id ? { ...c, likes: c.likes + (c.isLiked ? -1 : 1), isLiked: !c.isLiked } : c));
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mt-2">
            {/* Input Area */}
            <div className="flex items-end gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold shrink-0">
                    Y
                </div>
                <div className="flex-1 bg-gray-50 rounded-2xl p-2 border border-gray-200">
                    {replyingTo && (
                        <div className="flex items-center justify-between text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg mb-2">
                            <span>{t('comment_reply')} to {comments.find(c => c.id === replyingTo)?.author}</span>
                            <button onClick={() => setReplyingTo(null)}><X size={14} /></button>
                        </div>
                    )}
                    <textarea
                        className="w-full bg-transparent text-sm focus:outline-none resize-none p-1 min-h-[40px]"
                        placeholder={isRecording ? t('comment_recording') : t('comment_placeholder')}
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        rows={1}
                    />
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-1">
                        <div className="flex gap-3 text-gray-400">
                            <button
                                className={`p-1.5 rounded-full hover:bg-gray-200 ${isRecording ? 'bg-red-100 text-red-500 animate-pulse' : ''}`}
                                onClick={() => setIsRecording(!isRecording)}
                            >
                                <Mic size={18} />
                            </button>
                            <button className="p-1.5 rounded-full hover:bg-gray-200">
                                <ImageIcon size={18} />
                            </button>
                        </div>
                        <button
                            className={`p-1.5 rounded-full bg-green-600 text-white ${!newComment && !isRecording ? 'opacity-50' : ''}`}
                            onClick={handleSend}
                            disabled={!newComment && !isRecording}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0 text-sm">
                            {comment.avatar}
                        </div>
                        <div className="flex-1">
                            <div className="bg-gray-50 rounded-2xl rounded-tl-none p-3 relative">
                                <div className="flex justify-between items-start">
                                    <span className="font-semibold text-sm text-gray-900">{comment.author}</span>
                                    <span className="text-[10px] text-gray-400">{comment.timestamp}</span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 mt-1 ml-2">
                                <button
                                    className={`flex items-center gap-1 text-xs font-medium ${comment.isLiked ? 'text-green-600' : 'text-gray-500'}`}
                                    onClick={() => toggleLike(comment.id)}
                                >
                                    <ThumbsUp size={12} /> {comment.likes > 0 ? comment.likes : t('comment_like')}
                                </button>
                                <button
                                    className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-blue-600"
                                    onClick={() => setReplyingTo(comment.id)}
                                >
                                    <Reply size={12} /> {t('comment_reply')}
                                </button>
                            </div>

                            {/* Replies */}
                            {comment.replies.length > 0 && (
                                <div className="mt-3 pl-3 border-l-2 border-gray-100 space-y-3">
                                    {comment.replies.map(reply => (
                                        <div key={reply.id} className="flex gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0 text-xs">
                                                {reply.avatar}
                                            </div>
                                            <div className="flex-1">
                                                <div className="bg-gray-50 rounded-xl rounded-tl-none p-2">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-semibold text-xs text-gray-900">{reply.author}</span>
                                                        <span className="text-[10px] text-gray-400">{reply.timestamp}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 mt-0.5">{reply.text}</p>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 ml-2">
                                                    <button
                                                        className={`flex items-center gap-1 text-[10px] font-medium ${reply.isLiked ? 'text-green-600' : 'text-gray-500'}`}
                                                        onClick={() => toggleLike(reply.id, true, comment.id)}
                                                    >
                                                        <ThumbsUp size={10} /> {reply.likes > 0 ? reply.likes : t('comment_like')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
