"use client";

import { Search } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useState, useEffect } from "react";

export function HomeHeader() {
    const { lang, setLanguage } = useAuth();
    const { t } = useLanguage();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="flex items-center justify-between px-4 py-4 bg-white sticky top-0 z-10 shadow-sm">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                    <h1 className="text-xl font-bold text-green-800">Keypaper</h1>
                </div>
                <span className="text-xs text-gray-500">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <Search size={20} />
                </button>

                <div className="flex items-center bg-gray-100 rounded-full px-1 py-1">
                    <button
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${lang === 'en' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500'
                            }`}
                        onClick={() => setLanguage('en')}
                    >
                        E
                    </button>
                    <button
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${lang === 'te' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500'
                            }`}
                        onClick={() => setLanguage('te')}
                    >
                        తె
                    </button>
                </div>
            </div>
        </header>
    );
}
