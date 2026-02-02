"use client";

import { Activity, Bookmark, Bell, Shield, FileText, HelpCircle, AlertTriangle, Info, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function AccountTools() {
    const { signOut, user, lang, setLanguage } = useAuth();
    const { t } = useLanguage();

    const menuItems = [
        { icon: Activity, labelKey: 'menu_my_activity', href: '#' },
        { icon: Bookmark, labelKey: 'menu_saved_items', href: '#' },
        { icon: Bell, labelKey: 'menu_notifications', href: '#' },
    ];

    const supportItems = [
        { icon: Shield, labelKey: 'menu_privacy_policy', href: '#' },
        { icon: FileText, labelKey: 'menu_terms', href: '#' },
        { icon: HelpCircle, labelKey: 'menu_help_support', href: '#' },
        { icon: AlertTriangle, labelKey: 'menu_report_issue', href: '#' },
    ];

    return (
        <div className="mx-4 mt-6 mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{t('settings_account')}</h3>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                {menuItems.map((item, idx) => (
                    <button key={idx} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                            <item.icon size={18} className="text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">{t(item.labelKey)}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                    </button>
                ))}
            </div>

            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{t('settings_support')}</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                {supportItems.map((item, idx) => (
                    <button key={idx} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                            <item.icon size={18} className="text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">{t(item.labelKey)}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                    </button>
                ))}
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                    <span className="text-xs text-gray-400">Version 1.0.0</span>
                </div>
            </div>

            {/* Language and Logout removed as they are now in the top header */}
        </div>
    );
}
