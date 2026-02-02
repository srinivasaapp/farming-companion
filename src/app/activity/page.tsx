"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { ArrowLeft, ThumbsUp, MessageCircle, BarChart2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ActivityPage() {
    const { t } = useLanguage();
    const router = useRouter();

    // Mock Data
    const activities = [
        {
            id: '1',
            type: 'like',
            title: 'Modern Pest Control Techniques',
            date: '2 hours ago',
            details: 'You found this helpful'
        },
        {
            id: '2',
            type: 'comment',
            title: 'Wheat Moisture Question',
            date: '1 day ago',
            details: 'You commented: "Great explanation!"'
        },
        {
            id: '3',
            type: 'poll',
            title: 'Which crop are you planting next?',
            date: '3 days ago',
            details: 'You voted: Cotton'
        }
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'like': return <ThumbsUp size={16} />;
            case 'comment': return <MessageCircle size={16} />;
            case 'poll': return <BarChart2 size={16} />;
            default: return <ThumbsUp size={16} />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'like': return 'text-green-600 bg-green-50';
            case 'comment': return 'text-blue-600 bg-blue-50';
            case 'poll': return 'text-purple-600 bg-purple-50';
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
                <h1 className="text-lg font-bold text-gray-900">{t('menu_my_activity') || 'My Activity'}</h1>
            </div>

            {/* List */}
            <div className="p-4 flex flex-col gap-3">
                {activities.length > 0 ? (
                    activities.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getColor(item.type)}`}>
                                {getIcon(item.type)}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 leading-tight">{item.title}</h3>
                                <p className="text-xs text-gray-500 mt-1">{item.details}</p>
                                <span className="text-[10px] font-medium text-gray-400 mt-2 block">{item.date}</span>
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
