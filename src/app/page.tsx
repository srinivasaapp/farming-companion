"use client";

import { HomeHeader } from "@/components/home/HomeHeader";
import { DashboardWidgets } from "@/components/home/DashboardWidgets";
import { WeatherWidget } from "@/components/home/WeatherWidget";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { useState } from "react";

export default function HomePage() {
  const { user, lang, setLanguage, setShowLoginModal } = useAuth();
  const { t } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Top Section: Header & Status */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100/50 supports-[backdrop-filter]:bg-white/60">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Left: Brand & Time */}
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-green-800 tracking-tight leading-none">Keypaper</h1>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
            >
              <Search size={18} />
            </button>

            <button
              className="h-9 px-3 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 font-bold text-xs hover:bg-gray-100 active:scale-95 transition-all border border-gray-100"
              onClick={() => setLanguage(lang === 'en' ? 'te' : 'en')}
            >
              {lang === 'en' ? 'తె' : 'En'}
            </button>

            {user ? (
              <Link href="/profile" className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold hover:bg-green-200 active:scale-95 transition-all border border-green-200">
                <UserIcon size={18} />
              </Link>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="h-9 px-4 rounded-full bg-green-600 text-white font-bold text-xs shadow-md hover:bg-green-700 active:scale-95 transition-all"
              >
                {t('profile_login')}
              </button>
            )}
          </div>
        </div>

        {/* Sub-Header: Weather & Location */}
        <WeatherWidget />
      </div>

      {/* Quick Updates Ticker */}
      <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 px-4 py-3 border-b border-green-100 flex items-center gap-3 overflow-hidden">
        <div className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
          {t('home_mandi_update')}
        </div>
        <p className="text-xs text-green-900 truncate font-medium">
          Tomato prices up by 12% in Hyderabad market today. Check new listings.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-6">
        <DashboardWidgets />
        <div className="text-center text-xs text-gray-400 py-4 mt-auto">
          {t('home_footer_copyright')}
        </div>

        {/* QR Code Section */}
        <div className="bg-white m-4 p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <h3 className="font-bold text-gray-800 mb-2">Get the Full Experience</h3>
          <p className="text-xs text-gray-500 mb-4 max-w-[200px]">
            Scan to visit keypaper.in or download the app on your phone.
          </p>
          <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-inner mb-4">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://keypaper.in"
              alt="Keypaper QR Code"
              className="w-32 h-32"
            />
          </div>
          <div className="flex gap-2 text-[10px] items-center text-gray-400 font-medium bg-gray-50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Scan with your camera
          </div>
        </div>
      </div>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}

import { User as UserIcon, MapPin, Bell, Search } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
