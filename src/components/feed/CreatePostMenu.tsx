"use client";

import React from "react";
import {
    X, HelpCircle, Users, BarChart2, Image as ImageIcon, Mic,
    MessageSquare, Award, BookOpen
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface CreatePostMenuProps {
    isOpen: boolean;
    onClose: () => void;
    userRole?: 'expert' | 'farmer' | string;
    onAction: (action: string) => void;
}

export function CreatePostMenu({ isOpen, onClose, userRole = 'farmer', onAction }: CreatePostMenuProps) {
    const { t } = useLanguage();

    if (!isOpen) return null;

    const isExpert = userRole === 'expert' || userRole === 'admin';

    const renderOption = (key: string, icon: React.ReactNode, labelKey: string, colorClass: string) => (
        <button
            key={key}
            onClick={() => { onAction(key); onClose(); }}
            className="flex flex-col items-center gap-3 p-4 active:scale-95 transition-transform"
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${colorClass}`}>
                {icon}
            </div>
            <span className="text-xs font-semibold text-gray-700 text-center w-20 leading-tight">
                {t(labelKey)}
            </span>
        </button>
    );

    const farmerOptions = [
        { key: 'ask', icon: <HelpCircle size={28} />, label: 'create_menu_ask', color: 'bg-orange-500' },
        { key: 'post', icon: <Users size={28} />, label: 'create_menu_post', color: 'bg-blue-500' },
        { key: 'poll', icon: <BarChart2 size={28} />, label: 'create_menu_poll', color: 'bg-purple-500' },
        { key: 'photo', icon: <ImageIcon size={28} />, label: 'create_menu_photo', color: 'bg-green-500' },
        { key: 'voice', icon: <Mic size={28} />, label: 'create_menu_voice', color: 'bg-red-500' },
    ];

    const expertOptions = [
        { key: 'answer', icon: <MessageSquare size={28} />, label: 'create_menu_answer', color: 'bg-blue-600' },
        { key: 'advisory', icon: <Award size={28} />, label: 'create_menu_advisory', color: 'bg-green-600' },
        { key: 'poll', icon: <BarChart2 size={28} />, label: 'create_menu_poll', color: 'bg-purple-600' },
        { key: 'knowledge', icon: <BookOpen size={28} />, label: 'create_menu_knowledge', color: 'bg-indigo-600' },
        { key: 'voice_advisory', icon: <Mic size={28} />, label: 'create_menu_voice_advisory', color: 'bg-red-600' },
    ];

    const options = isExpert ? expertOptions : farmerOptions;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-t-3xl p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                </div>

                <div className="grid grid-cols-3 gap-y-6 gap-x-2">
                    {options.map(opt => renderOption(opt.key, opt.icon, opt.label, opt.color))}
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
