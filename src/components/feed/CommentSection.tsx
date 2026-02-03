"use client";

import React, { useState, useEffect } from "react";
import { Mic, Image as ImageIcon, Send, ThumbsUp, MessageCircle, X, Reply, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { getComments, createComment, createNotification } from "@/lib/services/api";
import { timeAgo } from "@/lib/utils/date";

interface Comment {
    id: string;
    author: string;
    avatar: string;
    text: string;
    likes: number;
    replies: Comment[];
    isLiked?: boolean;
    timestamp: string;
    authorId: string;
}

interface CommentSectionProps {
    postId: string;
    authorId?: string; // The author of the post (for notifications)
    postType?: string; // 'question', 'listing', etc.
}

export function CommentSection({ postId, authorId, postType }: CommentSectionProps) {
    const { t } = useLanguage();
    const { user, profile } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    const [newComment, setNewComment] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [replyingTo, setReplyingTo] = useState<{ id: string, author: string } | null>(null);
    const [sending, setSending] = useState(false);

    // Fetch Comments
    useEffect(() => {
        loadComments();
    }, [postId]);

    const loadComments = async () => {
        if (!postId) return;
        try {
            const data = await getComments(postId);

            // Organize into nested structure
            // 1. Create map of all comments
            const commentMap = new Map();
            const roots: Comment[] = [];

            // First pass: Format all comments
            data.forEach((c: any) => {
                const formatted: Comment = {
                    id: c.id,
                    author: c.profiles?.full_name || c.profiles?.username || 'Unknown',
                    avatar: (c.profiles?.full_name?.[0] || c.profiles?.username?.[0] || 'U').toUpperCase(),
                    text: c.content,
                    likes: 0, // TODO: Implement likes
                    replies: [],
                    timestamp: timeAgo(c.created_at),
                    authorId: c.author_id
                };
                commentMap.set(c.id, { ...formatted, rawParentId: c.parent_id });
            });

            // Second pass: Build hierarchy
            commentMap.forEach((comment) => {
                if (comment.rawParentId) {
                    const parent = commentMap.get(comment.rawParentId);
                    if (parent) {
                        parent.replies.push(comment);
                    } else {
                        roots.push(comment); // Parent missing? Treat as root
                    }
                } else {
                    roots.push(comment);
                }
            });

            setComments(roots);
        } catch (err) {
            console.error("Failed to load comments", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if ((!newComment.trim() && !isRecording) || !user || !profile) return;
        setSending(true);

        try {
            const content = newComment;

            // 1. Create Comment in DB
            const data = await createComment({
                post_id: postId,
                author_id: user.id,
                content: content,
                parent_id: replyingTo?.id,
                post_type: postType
            });

            // 2. Clear input
            setNewComment("");
            setReplyingTo(null);

            // 3. Notify the post author (if not self)
            if (authorId && authorId !== user.id && !replyingTo) {
                await createNotification({
                    user_id: authorId,
                    type: 'reply',
                    content: `${profile.full_name || 'Someone'} commented on your post`,
                    related_id: postId
                });
            }
            // 3.1 Notify the comment author (if replying)
            if (replyingTo && replyingTo.author !== user.id) {
                // Try to find the original comment author ID from the comments list if available,
                // currently we don't have it easily accessible in 'replyingTo' unless we pass it.
                // For now, simplify.
            }

            // 4. Refresh comments (easiest way to sync ID and timestamp)
            await loadComments();

        } catch (err) {
            console.error("Failed to post comment", err);
            // Optionally show toast error
        } finally {
            setSending(false);
            setIsRecording(false);
        }
    };

    const toggleLike = (id: string) => {
        // Mock like for now as DB support isn't fully added for likes on comments yet
        console.log("Like toggled for", id);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mt-2">
            {/* Input Area */}
            <div className="flex items-end gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold shrink-0">
                    {profile?.full_name?.[0] || profile?.username?.[0] || 'Y'}
                </div>
                <div className="flex-1 bg-gray-50 rounded-2xl p-2 border border-gray-200">
                    {replyingTo && (
                        <div className="flex items-center justify-between text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg mb-2">
                            <span>{t('comment_reply') || 'Replying'} to {replyingTo.author}</span>
                            <button onClick={() => setReplyingTo(null)}><X size={14} /></button>
                        </div>
                    )}
                    <textarea
                        className="w-full bg-transparent text-sm focus:outline-none resize-none p-1 min-h-[40px]"
                        placeholder={isRecording ? (t('comment_recording') || 'Recording...') : (t('comment_placeholder') || 'Write a comment...')}
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        rows={1}
                        disabled={sending}
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
                            className={`p-1.5 rounded-full bg-green-600 text-white ${(!newComment && !isRecording) || sending ? 'opacity-50' : ''}`}
                            onClick={handleSend}
                            disabled={(!newComment && !isRecording) || sending}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-4 text-gray-400 text-sm">Loading comments...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-sm">No comments yet. Be the first!</div>
                ) : (
                    comments.map(comment => (
                        <RenderComment
                            key={comment.id}
                            comment={comment}
                            onReply={(id, author) => setReplyingTo({ id, author })}
                            onLike={toggleLike}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function RenderComment({ comment, onReply, onLike }: { comment: Comment, onReply: (id: string, author: string) => void, onLike: (id: string) => void }) {
    const { t } = useLanguage();

    return (
        <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0 text-sm uppercase">
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
                        onClick={() => onLike(comment.id)}
                    >
                        <ThumbsUp size={12} /> {comment.likes > 0 ? comment.likes : (t('comment_like') || 'Like')}
                    </button>
                    <button
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-blue-600"
                        onClick={() => onReply(comment.id, comment.author)}
                    >
                        <Reply size={12} /> {t('comment_reply') || 'Reply'}
                    </button>
                </div>

                {/* Replies */}
                {comment.replies.length > 0 && (
                    <div className="mt-3 pl-3 border-l-2 border-gray-100 space-y-3">
                        {comment.replies.map(reply => (
                            <RenderComment
                                key={reply.id}
                                comment={reply}
                                onReply={onReply}
                                onLike={onLike}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
