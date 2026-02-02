"use client";

import { HomeHeader } from "@/components/home/HomeHeader";
import { DashboardWidgets } from "@/components/home/DashboardWidgets";

export default function HomePage() {
  const { user, lang, setLanguage, setShowLoginModal } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Top Section: Location & Profile */}
      {/* Top Section: Header & Status */}
      {/* Top Section: Header & Status - REMOVED per request */}
      {/* 
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
           ...
        </div>
      </div>
      */}

      {/* Simplified Brand Strip (Optional, keeping it minimal) */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-30">
        <h1 className="text-xl font-black text-green-800 tracking-tight leading-none">Keypaper</h1>
        <div className="flex gap-2">
          {/* Quick Actions if needed, else empty */}
          {user && (
            <Link href="/profile" className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-700">
              <UserIcon size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* Quick Updates Ticker */}
      <div className="bg-green-50 px-4 py-3 border-b border-green-100 flex items-center gap-3 overflow-hidden">
        <div className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
          Mandi Update
        </div>
        <p className="text-xs text-green-900 truncate font-medium">
          Tomato prices up by 12% in Hyderabad market today. Check new listings.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-6">
        <DashboardWidgets />

        <div className="text-center text-xs text-gray-400 py-4 mt-auto">
          copyright 2026 @ keypaper.in
        </div>      </div>
    </div>
  );
}

import { User as UserIcon, MapPin, Bell, Search } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
