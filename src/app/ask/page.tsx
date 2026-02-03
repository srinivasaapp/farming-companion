"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import styles from "./page.module.css";
import { FeedHeader, UserRole } from "@/components/common/FeedHeader";
import { Plus, Search, HelpCircle, AlertCircle, RefreshCcw, Camera, Image as ImageIcon, X, Trash2, ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import { CommentSection } from "@/components/feed/CommentSection";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getQuestions, createQuestion, uploadImage, deleteQuestion } from "@/lib/services/api";
import { shareContent } from "@/lib/utils/share";

const safeRender = (content: string | { text: string } | null | undefined) => {
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null) {
        // @ts-ignore - Dynamic Supabase JSON content
        return content.text || JSON.stringify(content);
    }
    return String(content || "");
};

interface Question {
    id: string;
    title: string;
    description: string;
    crop: string;
    image_url?: string;
    is_solved: boolean;
    answers_count: number;
    created_at: string;
    author_id: string;
    profiles?: {
        full_name: string;
        username: string;
        role: string;
    };
    hasExpertAnswer?: boolean;
}

export default function AskPage() {
    const { t } = useLanguage();
    const { user, setShowLoginModal } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null);
    const [showAskModal, setShowAskModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newCrop, setNewCrop] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setPageError(null);
        try {
            // Fetch first page only for speed
            const data = await getQuestions(0, 20);
            setQuestions(data as unknown as Question[]);
        } catch (err: any) {
            console.error("AskPage: Failed to load questions:", err.message || err);
            setPageError(err.message || "Failed to load community questions.");
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAsk = () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        setShowAskModal(true);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm(t('generic_confirm_delete') || "Are you sure?")) return;

        try {
            await deleteQuestion(id);
            // Optimistic update
            setQuestions(prev => prev.filter(q => q.id !== id));
        } catch (err) {
            console.error("Failed to delete", err);
            alert("Failed to delete");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!newTitle.trim() || !newCrop.trim()) return;

        setIsSubmitting(true);
        try {
            let imageUrl = undefined;
            if (selectedImage) {
                try {
                    imageUrl = await uploadImage(selectedImage, 'questions');
                } catch (uploadErr) {
                    console.error("Image upload failed:", uploadErr);
                    // Decide if we want to stop or continue without image
                    // Continuing without image for now, but could alert user
                }
            }

            await createQuestion(newTitle, newDesc, newCrop, user.id, imageUrl);
            setNewTitle("");
            setNewDesc("");
            setNewCrop("");
            setSelectedImage(null);
            setPreviewUrl(null);
            setShowAskModal(false);
            loadData(); // Refresh the feed
        } catch (err: any) {
            console.error("AskPage: Failed to post question:", err);
            alert("Failed to post question. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);

    const filteredQuestions = useMemo(() => {
        const lowerQuery = searchQuery.toLowerCase();
        let filtered = questions.filter(q =>
            q.title.toLowerCase().includes(lowerQuery) ||
            (q.description && q.description.toLowerCase().includes(lowerQuery))
        );

        if (selectedRoles.length > 0) {
            filtered = filtered.filter(q => selectedRoles.includes(q.profiles?.role as UserRole));
        }
        return filtered;
    }, [searchQuery, questions, selectedRoles]);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
            <FeedHeader
                title={t('nav_ask')}
                uploadPath="/ask/upload"
                selectedRoles={selectedRoles}
                onRoleChange={setSelectedRoles}
            />

            <div className="p-4 sticky top-[58px] z-30 bg-gray-50 pb-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder={t('ask_search_placeholder')}
                        className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex justify-between items-center px-4 mt-4">
                <h2 className="font-bold text-gray-700">Community & Expert Q&A</h2>
                {/* Plus button removed as it is now in the header */}
            </div>

            <div className={styles.feed}>
                {loading ? (
                    <div className={styles.loaderContainer}>
                        <div className={styles.spinner}></div>
                        <p>{t('generic_loading')}</p>
                    </div>
                ) : pageError ? (
                    <div className={styles.errorState}>
                        <div className={styles.errorIconContainer}>
                            <AlertCircle size={32} />
                        </div>
                        <h3>Connection Issue</h3>
                        <p>{pageError}</p>
                        <button
                            onClick={loadData}
                            className={styles.retryButton}
                        >
                            <RefreshCcw size={18} /> Retry
                        </button>
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <HelpCircle size={48} className="mb-2 opacity-20" />
                        <p>{t('ask_search_no_results') || 'No questions found.'}</p>
                    </div>
                ) : (
                    filteredQuestions.map((q) => (
                        <div key={q.id} className={styles.questionCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.userInfo}>
                                    <div className={styles.avatar}>{q.profiles?.full_name?.substring(0, 1)}</div>
                                    <div className={styles.meta}>
                                        <span className={styles.userName}>{q.profiles?.full_name}</span>
                                        <span className={styles.time}>{q.crop}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {/* DEBUG: Log IDs to console */}
                                    {console.log(`Question ${q.id}: user=${user?.id}, author=${q.author_id}, match=${user?.id === q.author_id}`)}

                                    {user && user.id === q.author_id && (
                                        <button
                                            onClick={(e) => handleDelete(e, q.id)}
                                            style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    <span className={`${styles.statusBadge} ${q.is_solved ? styles.statusSolved : styles.statusUnsolved}`}>
                                        {q.is_solved ? t('ask_solved') : t('ask_unsolved')}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.questionTitle}>{q.title}</h3>
                                <p className={styles.questionPreview}>{safeRender(q.description)}</p>
                                {q.image_url && (
                                    <div style={{ marginTop: '8px', borderRadius: '12px', overflow: 'hidden', height: '200px', width: '100%' }}>
                                        <img src={q.image_url} alt="Question Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                            </div>

                            {/* Action Bar */}
                            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 mt-2">
                                <button className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors">
                                    <ThumbsUp size={18} />
                                    <span className="text-xs font-medium">{t('story_action_useful')}</span>
                                </button>
                                <button
                                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!user) {
                                            setShowLoginModal(true);
                                            return;
                                        }
                                        // Toggle logic: If clicking same, close it. If different, open new.
                                        setActiveQuestionId(activeQuestionId === q.id ? null : q.id);
                                    }}
                                >
                                    <MessageCircle size={18} />
                                    <span className="text-xs font-medium">{t('comment_reply')}</span>
                                </button>
                                <button
                                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        await shareContent({
                                            title: q.title,
                                            text: `Help answer this question: ${q.title}`,
                                            url: window.location.href
                                        });
                                    }}
                                >
                                    <Share2 size={18} />
                                    <span className="text-xs font-medium">{t('story_action_share')}</span>
                                </button>
                            </div>

                            {/* Comments Section */}
                            {activeQuestionId === q.id && (
                                <div className="px-4 pb-4 animate-in slide-in-from-top duration-200">
                                    <div className="border-t border-gray-100 pt-2">
                                        <CommentSection postId={q.id} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Ask Question Modal */}
            {showAskModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAskModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>{t('ask_button')}</h2>
                            <button className={styles.closeBtn} onClick={() => setShowAskModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>{t('ask_title_label') || 'Title'}</label>
                                <input
                                    className={styles.input}
                                    placeholder={t('ask_title_placeholder') || 'What is your question?'}
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>{t('ask_desc_label') || 'Description'}</label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder={t('ask_desc_placeholder') || 'Provide more details...'}
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>{t('ask_crop_label') || 'Crop Type'}</label>
                                <input
                                    className={styles.input}
                                    placeholder={t('ask_crop_placeholder') || 'e.g. Rice, Wheat, Cotton'}
                                    value={newCrop}
                                    onChange={e => setNewCrop(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Photos (Optional)</label>
                                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '12px',
                                            border: '2px dashed #E5E7EB',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#6B7280',
                                            cursor: 'pointer',
                                            flexShrink: 0
                                        }}
                                    >
                                        <Camera size={24} />
                                        <span style={{ fontSize: '10px', marginTop: '4px' }}>Add</span>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                    {previewUrl && (
                                        <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { setSelectedImage(null); setPreviewUrl(null); }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '-6px',
                                                    right: '-6px',
                                                    background: '#EF4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '20px',
                                                    height: '20px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={isSubmitting || !newTitle.trim() || !newCrop.trim()}
                            >
                                {isSubmitting ? t('generic_loading') : t('ask_button')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
