"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { getNotifications, markNotificationRead } from "@/lib/services/api";
import { timeAgo } from "@/lib/utils/date";
import { ArrowLeft, Bell, MessageCircle, ThumbsUp, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Notification {
    id: string;
    type: 'reply' | 'like' | 'system';
    content: string;
    created_at: string;
    is_read: boolean;
    related_id?: string;
}

export default function NotificationsPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const router = useRouter();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadNotifications();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadNotifications = async () => {
        try {
            if (!user) return;
            const data = await getNotifications(user.id);
            setNotifications(data);
        } catch (err) {
            console.error("Failed to load notifications", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = async (notification: Notification) => {
        if (!notification.is_read) {
            try {
                await markNotificationRead(notification.id);
                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
            } catch (err) {
                console.error("Failed to mark read", err);
            }
        }

        // Navigate to content if applicable
        if (notification.related_id) {
            // Determine path based on context or just try to find it. 
            // Since we don't strictly know the type (question vs listing) from just ID in this simple table,
            // we might default to one or try to guess. 
            // Ideally 'related_id' would be enough if we had a unified route or 'type' in notification.
            // For now, let's assume it's a question or handle generic redirect.

            // If the notification type came from a comment reply, it's likely on a post.
            // We'll simplisticly route to /questions/[id] or handle logic if we saved 'type' in DB more granularly.
            // But wait, our API `createNotification` just takes `related_id`.
            // Let's assume most are questions for now or generic view.
            // A better way is to store 'link' in notification or 'resource_type'.
            // I'll leave it as a TODO to route correctly, for now just mark read.
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'reply': return <MessageCircle size={16} />;
            case 'like': return <ThumbsUp size={16} />;
            case 'system': return <Star size={16} />;
            default: return <Bell size={16} />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'reply': return 'text-blue-600 bg-blue-50';
            case 'like': return 'text-green-600 bg-green-50';
            case 'system': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-30">
                <Link href="/profile" className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-lg font-bold text-gray-900">{t('menu_notifications') || 'Notifications'}</h1>
            </div>

            {/* List */}
            <div className="p-4 flex flex-col gap-3">
                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading...</div>
                ) : notifications.length > 0 ? (
                    notifications.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleClick(item)}
                            className={`p-4 rounded-xl border flex gap-3 cursor-pointer transition-colors ${!item.is_read ? 'bg-white border-green-100 shadow-sm' : 'bg-gray-50 border-gray-100'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getColor(item.type)}`}>
                                {getIcon(item.type)}
                            </div>
                            <div>
                                <p className={`text-sm ${!item.is_read ? 'text-gray-900 font-bold' : 'text-gray-600'} leading-snug`}>{item.content}</p>
                                <span className="text-[10px] font-medium text-gray-400 mt-2 block">{timeAgo(item.created_at)}</span>
                            </div>
                            {!item.is_read && (
                                <div className="w-2 h-2 bg-green-500 rounded-full ml-auto shrink-0 mt-1.5"></div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Bell size={48} className="opacity-20 mb-3" />
                        <p>{t('generic_no_results') || 'No new notifications'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
