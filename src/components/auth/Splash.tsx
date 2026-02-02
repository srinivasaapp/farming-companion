"use client";

import React, { useEffect } from "react";
import styles from "./Splash.module.css";
import { Leaf } from "lucide-react";

interface SplashProps {
    onComplete: () => void;
}

export function Splash({ onComplete }: SplashProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 2500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.logo}>
                    <img src="/logo.png" alt="Keypaper" className="w-32 h-32 object-contain" />
                </div>
                <h1 className={styles.title}>Keypaper</h1>
                <p className={styles.tagline}>From soil to sale – all farming in one app</p>
                <div className={styles.loader}></div>
            </div>
        </div>
    );
}
