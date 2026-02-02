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
    const { signIn, resetPasswordForEmail } = useAuth();
    const { t } = useLanguage();
    const [view, setView] = useState<"login" | "forgot">("login");
    const [resetSent, setResetSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (view === "forgot") {
            const { error } = await resetPasswordForEmail(email);
            setLoading(false);
            if (error) {
                setError(error.message);
            } else {
                setResetSent(true);
            }
            return;
        }

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
                <h1 className={styles.title}>{view === "login" ? t('auth_title_login') : "Reset Password"}</h1>
                <p className={styles.subtitle}>{view === "login" ? t('auth_subtitle_login') : "Enter your email to receive instructions"}</p>
            </div>

            <div className={styles.formCard}>
                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {resetSent ? (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <img src="/logo.png" className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Check your email</h3>
                        <p className="text-center text-gray-600 text-sm">
                            We have sent password reset instructions to <b>{email}</b>.
                        </p>
                        <button
                            type="button"
                            onClick={() => { setView("login"); setResetSent(false); }}
                            className={styles.button}
                        >
                            Back to Login
                        </button>
                    </div>
                ) : (
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

                            {view === "login" && (
                                <div>
                                    <label className={styles.label}>
                                        {t('auth_password')}
                                        <button
                                            type="button"
                                            onClick={() => setView("forgot")}
                                            className="float-right text-xs font-medium text-green-600 hover:underline"
                                        >
                                            Forgot password?
                                        </button>
                                    </label>
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
                            )}
                        </div>

                        <button type="submit" className={styles.button} disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2 justify-center">
                                    Running...
                                </span>
                            ) : (
                                view === "login" ? t('auth_btn_login') : "Send Reset Link"
                            )}
                        </button>

                        {view === "login" && onSwitchToSignup && (
                            <button
                                type="button"
                                className={styles.backButton}
                                onClick={onSwitchToSignup}
                            >
                                {t('auth_switch_to_signup')}
                            </button>
                        )}

                        {view === "forgot" && (
                            <button
                                type="button"
                                className={styles.backButton}
                                onClick={() => setView("login")}
                            >
                                Cancel
                            </button>
                        )}
                    </form>
                )}
            </div>

            <div className={styles.footer}>
                <p>{t('auth_terms')}</p>
            </div>
        </div>
    );
}
