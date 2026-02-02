"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { ArrowLeft, Search, ChevronRight, Mail, Phone, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
    const { t } = useLanguage();

    const faqs = [
        "How do I change my language?",
        "How to post a question?",
        "Is the expert advice free?",
        "How to sell on Marketplace?"
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-30">
                <Link href="/profile" className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-lg font-bold text-gray-900">{t('menu_help_support') || 'Help & Support'}</h1>
            </div>

            <div className="p-4 space-y-6">

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search help topics..."
                        className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <a href="mailto:support@keypaper.in" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 text-center active:scale-95 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Mail size={20} />
                        </div>
                        <span className="text-sm font-bold text-gray-700">Email Us</span>
                    </a>
                    <a href="tel:+911234567890" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 text-center active:scale-95 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <Phone size={20} />
                        </div>
                        <span className="text-sm font-bold text-gray-700">Call Us</span>
                    </a>
                </div>

                {/* FAQs */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Common Questions</h3>
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        {faqs.map((q, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 text-left border-b border-gray-50 last:border-none">
                                <span className="text-gray-700 font-medium text-sm">{q}</span>
                                <ChevronRight size={18} className="text-gray-300" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Legal Links */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Legal</h3>
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <Link href="/privacy" className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 border-b border-gray-50">
                            <span className="text-gray-700 font-medium text-sm">Privacy Policy</span>
                            <ExternalLink size={16} className="text-gray-300" />
                        </Link>
                        <Link href="/terms" className="flex items-center justify-between p-4 bg-white hover:bg-gray-50">
                            <span className="text-gray-700 font-medium text-sm">Terms of Service</span>
                            <ExternalLink size={16} className="text-gray-300" />
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
