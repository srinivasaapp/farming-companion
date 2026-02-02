"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { ArrowLeft, Bell, MessageCircle, ThumbsUp, Star } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
    const { t } = useLanguage();

    // Mock Data
    const notifications = [
        {
            id: '1',
            type: 'reply',
            text: 'Dr. Singh replied to your question: "Use Neem oil..."',
            date: '10 min ago',
            read: false
        },
        {
            id: '2',
            type: 'like',
            text: 'Raju and 5 others found your tip helpful.',
            date: '1 hour ago',
            read: true
        },
        {
            id: '3',
            type: 'system',
            text: 'Welcome to Keypaper! Complete your profile.',
            date: '2 days ago',
            read: true
        }
    ];

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
                {notifications.length > 0 ? (
                    notifications.map((item) => (
                        <div key={item.id} className={`p-4 rounded-xl border flex gap-3 ${item.read ? 'bg-white border-gray-100' : 'bg-blue-50/50 border-blue-100'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getColor(item.type)}`}>
                                {getIcon(item.type)}
                            </div>
                            <div>
                                <p className={`text-sm ${item.read ? 'text-gray-700' : 'text-gray-900 font-semibold'} leading-snug`}>{item.text}</p>
                                <span className="text-[10px] font-medium text-gray-400 mt-2 block">{item.date}</span>
                            </div>
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
