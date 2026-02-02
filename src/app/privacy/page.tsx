"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-30">
                <Link href="/profile" className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-lg font-bold text-gray-900">{t('menu_privacy_policy') || 'Privacy Policy'}</h1>
            </div>

            <div className="p-5 prose prose-green prose-sm max-w-none text-gray-600">
                <h3>1. Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, update your profile, post content, or communicate with us.</p>

                <h3>2. How We Use Information</h3>
                <p>We use your information to provide, maintain, and improve our services, including to facilitate connections between farmers and experts.</p>

                <h3>3. Information Sharing</h3>
                <p>We do not share your personal information with third parties except as described in this policy or with your consent.</p>

                <h3>4. Data Security</h3>
                <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access.</p>

                <p className="text-xs text-gray-400 mt-8">Last Updated: Feb 2026</p>
            </div>
        </div>
    );
}
