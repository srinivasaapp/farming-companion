"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlaySquare, MessageCircleQuestion, ShoppingBag, BookOpen } from "lucide-react";
import styles from "./Navigation.module.css";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

const navItems = [
    { key: "nav_learn", href: "/learn", icon: BookOpen },
    { key: "nav_stories", href: "/stories", icon: PlaySquare },
    { key: "nav_home", href: "/", icon: Home },
    { key: "nav_ask", href: "/ask", icon: MessageCircleQuestion },
    { key: "nav_market", href: "/market", icon: ShoppingBag },
];

export function Navigation() {
    const pathname = usePathname();
    const { lang, setLanguage } = useAuth();
    const { t } = useLanguage();

    // Hide Navigation on specific pages like News Detail
    if (pathname?.startsWith("/news")) {
        return null;
    }

    return (
        <>
            {/* Header Removed for Mobile-First Design */}

            <nav className={styles.mobileNav}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.item} ${isActive ? styles.active : ""}`}
                        >
                            <item.icon size={24} />
                            {/* <span className={styles.label}>{t(item.key)}</span> */}
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
