import React, { useState } from "react";
import styles from "./Login.module.css";
import { Leaf, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface LoginProps {
    onLogin: () => void;
    onSwitchToSignup?: () => void;
}

export function Login({ onLogin, onSwitchToSignup }: LoginProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const { t } = useLanguage();
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await signIn(email, password);

        setLoading(false);
        if (error) {
            setError(error.message);
        } else {
            console.log("Login: Success, awaiting AuthProvider lifecycle resolution...");
            onLogin();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.logoSmall}>
                    <img src="/logo.png" alt="Keypaper" className="w-16 h-16 object-contain" />
                </div>
                <h1 className={styles.title}>{t('auth_title_login')}</h1>
                <p className={styles.subtitle}>{t('auth_subtitle_login')}</p>
            </div>

            <div className={styles.formCard}>
                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className="space-y-4">
                        <div>
                            <label className={styles.label}>{t('auth_email')}</label>
                            <div className={styles.inputGroup}>
                                <input
                                    type="email"
                                    className={styles.input}
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className={styles.label}>{t('auth_password')}</label>
                            <div className={styles.inputGroup}>
                                <input
                                    type="password"
                                    className={styles.input}
                                    placeholder="******"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? t('auth_btn_logging_in') : t('auth_btn_login')}
                    </button>

                    {onSwitchToSignup && (
                        <button
                            type="button"
                            className={styles.backButton}
                            onClick={onSwitchToSignup}
                        >
                            {t('auth_switch_to_signup')}
                        </button>
                    )}
                </form>
            </div>

            <div className={styles.footer}>
                <p>{t('auth_terms')}</p>
            </div>
        </div>
    );
}
