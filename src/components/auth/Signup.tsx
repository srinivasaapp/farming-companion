"use client";

import React, { useState } from "react";
import styles from "./Login.module.css";
import { Leaf, ArrowRight, Loader2, Check } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Turnstile } from '@marsidev/react-turnstile';

interface SignupProps {
    onSignupSuccess: () => void;
    onSwitchToLogin: () => void;
}

export function Signup({ onSignupSuccess, onSwitchToLogin }: SignupProps) {
    const [step, setStep] = useState<"details" | "verification">("details");
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "" // Optional
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [captchaToken, setCaptchaToken] = useState<string | undefined>(undefined);
    const { signUp } = useAuth();
    const { t } = useLanguage();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Username constraints: lowercase, no spaces
        if (name === "username") {
            const cleanValue = value.toLowerCase().replace(/\s/g, "");
            setFormData(prev => ({ ...prev, [name]: cleanValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        if (formData.username.length < 3) {
            setError("Username must be at least 3 characters");
            return;
        }
        if (formData.username.length < 3) {
            setError("Username must be at least 3 characters");
            return;
        }

        // CAPTCHA Check
        const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
        if (siteKey && !captchaToken) {
            setError("Please verify you are human");
            return;
        }
        setLoading(true);

        const metadata = {
            username: formData.username,
            full_name: formData.username, // Default full name as username initially
            phone: formData.phone || null,
            role: 'farmer' // Default role
        };

        const { error, data } = await signUp(formData.email, formData.password, metadata, captchaToken);

        setLoading(false);

        if (error) {
            setError(error.message);
        } else {
            if (data?.session) {
                console.log("Signup: Direct session established, awaiting profile repair...");
                onSignupSuccess();
            } else {
                console.log("Signup: Verification required.");
                setStep("verification");
            }
        }
    };

    if (step === "verification") {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.logoSmall}>
                        <img src="/logo.png" alt="Keypaper" className="w-16 h-16 object-contain" />
                    </div>
                    <h1 className={styles.title}>{t('auth_verify_title')}</h1>
                    <p className={styles.subtitle}>{t('auth_verify_sent')} <b>{formData.email}</b></p>
                </div>
                <div className={styles.formCard}>
                    <div className="flex flex-col items-center gap-4 py-6 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <Check size={32} />
                        </div>
                        <p className="text-gray-600 text-sm">
                            {t('auth_verify_instructions')}
                        </p>
                        <button
                            className={styles.button}
                            onClick={onSwitchToLogin}
                        >
                            {t('auth_back_to_login')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.logoSmall}>
                    <img src="/logo.png" alt="Keypaper" className="w-16 h-16 object-contain" />
                </div>
                <h1 className={styles.title}>{t('auth_title_signup')}</h1>
                <p className={styles.subtitle}>{t('auth_subtitle_signup')}</p>
            </div>

            <div className={styles.formCard}>
                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className={styles.form}>
                    <div className="space-y-3">
                        <div>
                            <label className={styles.label}>{t('auth_username')} <span className="text-xs text-gray-400 font-normal">{t('auth_username_hint')}</span></label>
                            <input
                                type="text"
                                name="username"
                                className={styles.input}
                                placeholder="farmer_joy"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className={styles.label}>{t('auth_email')}</label>
                            <input
                                type="email"
                                name="email"
                                className={styles.input}
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={styles.label}>{t('auth_password')}</label>
                                <input
                                    type="password"
                                    name="password"
                                    className={styles.input}
                                    placeholder="******"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className={styles.label}>{t('auth_confirm_password')}</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className={styles.input}
                                    placeholder="******"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className={styles.label}>{t('auth_phone')} <span className="text-xs text-gray-400 font-normal">{t('auth_phone_hint')}</span></label>
                            <div className={styles.inputGroup}>
                                <span className={styles.countryCode}>+91</span>
                                <input
                                    type="tel"
                                    name="phone"
                                    className={styles.input}
                                    placeholder="98765 43210"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Turnstile Widget */}
                    {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                        <div className="flex justify-center py-2">
                            <Turnstile
                                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                                onSuccess={setCaptchaToken}
                            />
                        </div>
                    )}

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : t('auth_btn_signup')}
                    </button>

                    <button
                        type="button"
                        className={styles.backButton}
                        onClick={onSwitchToLogin}
                    >
                        {t('auth_switch_to_login')}
                    </button>
                </form>
            </div>
        </div>
    );
}
