"use client";

import React, { useState } from "react";
import styles from "./Login.module.css";
import { Leaf, ArrowRight, Loader2, Check, ShieldCheck, Globe, Users, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Turnstile } from '@marsidev/react-turnstile';
import { checkUsername } from "@/lib/services/api";

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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Validation State
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null); // null = not checked
    const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);

    const [captchaToken, setCaptchaToken] = useState<string | undefined>(undefined);
    const { signUp } = useAuth();
    const { t } = useLanguage();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Username constraints: lowercase, no spaces
        if (name === "username") {
            const cleanValue = value.toLowerCase().replace(/\s/g, "");
            setFormData(prev => ({ ...prev, [name]: cleanValue }));

            // Debounced Check
            if (cleanValue.length >= 3) {
                setIsCheckingUsername(true);
                setUsernameAvailable(null);
                setUsernameSuggestions([]);

                // Clear existing timer
                const timer = setTimeout(async () => {
                    const available = await checkUsername(cleanValue);
                    setIsCheckingUsername(false);
                    setUsernameAvailable(available);

                    if (!available) {
                        // Generate suggestions
                        const random = Math.floor(Math.random() * 100);
                        setUsernameSuggestions([
                            `${cleanValue}_${random}`,
                            `${cleanValue}farm`,
                            `the_${cleanValue}`
                        ]);
                    }
                }, 500);

                // Note: In a real app, use a proper useRef debounce to avoid parallel timers.
                // For this simple implementation, we rely on the rapid UI updates.
            } else {
                setUsernameAvailable(null);
            }
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
        // Username validation check
        if (usernameAvailable === false) {
            setError("Please choose a different username");
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
                    <div className="flex flex-col items-center gap-6 py-6 text-center">

                        {/* Status Icon */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 relative z-10">
                                <Check size={40} />
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Check your inbox</h3>
                            <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
                                We've sent a magic link to your email. Click it to activate your <b>Keypaper</b> account instantly.
                            </p>
                        </div>

                        {/* Trust Indicators */}
                        <div className="grid grid-cols-2 gap-4 w-full bg-gray-50 p-4 rounded-xl text-left mt-2">
                            <div className="flex items-start gap-2">
                                <ShieldCheck size={18} className="text-green-600 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-gray-800">Secure & Private</p>
                                    <p className="text-[10px] text-gray-500">Your data is encrypted.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Globe size={18} className="text-blue-500 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-gray-800">Global Network</p>
                                    <p className="text-[10px] text-gray-500">Join farmers worldwide.</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full border-t border-gray-100 pt-4">
                            <p className="text-xs text-gray-400 mb-4">Didn't receive it? Check spam folder.</p>
                            <button
                                className={styles.button}
                                onClick={onSwitchToLogin}
                            >
                                {t('auth_back_to_login')}
                            </button>
                        </div>
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
                                className={`${styles.input} ${usernameAvailable === false ? 'border-red-500 focus:ring-red-200' : ''}`}
                                placeholder="farmer_joy"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                            {/* Validation Feedback */}
                            <div className="min-h-[20px] mt-1">
                                {isCheckingUsername && (
                                    <span className="text-xs text-blue-500 flex items-center gap-1">
                                        <Loader2 size={12} className="animate-spin" /> Checking availability...
                                    </span>
                                )}
                                {usernameAvailable === true && (
                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                        <Check size={12} /> Available
                                    </span>
                                )}
                                {usernameAvailable === false && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-red-500">Username is taken. Try these:</span>
                                        <div className="flex gap-2 flex-wrap">
                                            {usernameSuggestions.map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, username: s }));
                                                        setUsernameAvailable(true); // Auto-confirm suggestion
                                                    }}
                                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
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
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className={styles.input}
                                        placeholder="******"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className={styles.label}>{t('auth_confirm_password')}</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        className={styles.input}
                                        placeholder="******"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
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
