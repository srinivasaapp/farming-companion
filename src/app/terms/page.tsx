"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-30">
                <Link href="/profile" className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-lg font-bold text-gray-900">{t('menu_terms') || 'Terms of Service'}</h1>
            </div>

            <div className="p-5 prose prose-green prose-sm max-w-none text-gray-600">
                <h3>1. Acceptance of Terms</h3>
                <p>By accessing or using our app, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the services.</p>

                <h3>2. User Accounts</h3>
                <p>You are responsible for safeguarding your account login credentials and for any activities or actions under your account.</p>

                <h3>3. Content Guidelines</h3>
                <p>You agree not to post content that is illegal, harmful, or violates the rights of others. We reserve the right to remove any content.</p>

                <h3>4. Termination</h3>
                <p>We may terminate or suspend your access to our services immediately, without prior notice or liability, for any reason whatsoever.</p>

                <p className="text-xs text-gray-400 mt-8">Last Updated: Feb 2026</p>
            </div>
        </div>
    );
}
