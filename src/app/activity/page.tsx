"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { ArrowLeft, MessageCircle, BarChart2, HelpCircle, Tag, BookOpen, Video, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserActivity } from "@/lib/services/api";
import { timeAgo } from "@/lib/utils/date";

export default function ActivityPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const { user } = useAuth();

    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!user) return;
            try {
                const data = await getUserActivity(user.id);
                setActivities(data);
            } catch (err) {
                console.error("Failed to load activity", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'question': return <HelpCircle size={16} />;
            case 'listing': return <Tag size={16} />;
            case 'news': return <BookOpen size={16} />;
            case 'story': return <Video size={16} />;
            default: return <BarChart2 size={16} />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'question': return 'text-orange-600 bg-orange-50';
            case 'listing': return 'text-green-600 bg-green-50';
            case 'news': return 'text-blue-600 bg-blue-50';
            case 'story': return 'text-purple-600 bg-purple-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getLabel = (type: string) => {
        switch (type) {
            case 'question': return 'You asked a question';
            case 'listing': return 'You listed an item';
            case 'news': return 'You published an article';
            case 'story': return 'You shared a story';
            default: return 'Activity';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-30">
                <Link href="/profile" className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-lg font-bold text-gray-900">{t('menu_my_activity') || 'My Activity'}</h1>
            </div>

            {/* List */}
            <div className="p-4 flex flex-col gap-3">
                {activities.length > 0 ? (
                    activities.map((item) => (
                        <div key={item.id + item.type} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getColor(item.type)}`}>
                                {getIcon(item.type)}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 leading-tight">{item.title}</h3>
                                <p className="text-xs text-gray-500 mt-1">{getLabel(item.type)}</p>
                                <span className="text-[10px] font-medium text-gray-400 mt-2 block">
                                    {timeAgo(item.created_at)}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <BarChart2 size={48} className="opacity-20 mb-3" />
                        <p>{t('generic_no_results') || 'No activity yet'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
