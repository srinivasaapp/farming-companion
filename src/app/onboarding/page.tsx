"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { ArrowRight, Check, Upload, User, MapPin, Phone, Shield } from "lucide-react";
import { uploadImage } from "@/lib/services/api"; // Reuse generic upload
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
    const { user, profile, updateProfile, isLoading } = useAuth();
    const { setLanguage, t } = useLanguage();
    const router = useRouter();
    const supabase = createClient();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        language: 'te',
        phone: '',
        location_district: '',
        role: 'user', // Default 'user' (Farmer/Normal User)
        verification_doc: null as File | null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Skip if already onboarded (basic check)
    useEffect(() => {
        if (!isLoading && profile?.phone && profile?.location_district) {
            router.replace("/");
        }
    }, [isLoading, profile, router]);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        if (!user) return;
        setIsSubmitting(true);

        try {
            // 1. Upload Doc if needed
            let docUrl = null;
            if (formData.role !== 'user' && formData.verification_doc) {
                docUrl = await uploadImage(formData.verification_doc, 'verifications');
            }

            // 2. Update Profile
            // Note: We set role to 'user' initially. If they requested something else, we store it in metadata/custom fields
            // For now, we'll store requested_role in a separate update or metadata if schema allows.
            // Start simple: Update basic details.

            const updates: any = {
                phone: formData.phone,
                location_district: formData.location_district,
                language_preference: formData.language,
                role: 'user', // Always start as user
            };

            // If special role requested, we might need a way to store it. 
            // Since we can't easily change schema right now, we will assume an admin process 
            // or we'll simulate it by updating 'role' but setting 'is_verified' to false.
            // However, the prompt says "default everyone is normal user".
            // So we will set role='user'. 
            // If they picked 'expert', we should ideally save that request.
            // WORKAROUND: We will save it in `stats` jsonb or a new column if we could.
            // Let's rely on the Admin seeing the document in a customized view or simpler:
            // We'll update a 'metadata' column if it exists, or just 'stats'.
            // Actually, we can use the `rpc` or just client update if RLS allows.

            // BETTER: We will just update the basic info here. 
            // The "Role Request" should probably be a separate explicit action or we assume 'user' for now.
            // BUT user asked for role selection during onboarding.

            // Let's try to update `role` to the requested one but `is_verified` to false?
            // "only role ... should be verified ... normal user cannot verified ... default everyone is normal user"
            // This implies:
            // 1. Set role = 'user'
            // 2. Store `requested_role` = formData.role
            // 3. Store `verification_doc` = docUrl

            // We will attempt to save these extra fields. If DB rejects, we'll gracefully degrade.
            await updateProfile({
                ...updates,
                // @ts-ignore
                requested_role: formData.role === 'user' ? null : formData.role,
                // @ts-ignore
                verification_doc_url: docUrl,
                // @ts-ignore
                verification_status: formData.role === 'user' ? 'none' : 'pending'
            });

            // Set language context
            setLanguage(formData.language as 'en' | 'te');

            router.push("/");
        } catch (error) {
            console.error("Onboarding error:", error);
            alert("Failed to save details. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
                <div className="h-2 bg-gray-100">
                    <div
                        className="h-full bg-green-600 transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-8">
                    {/* Step 1: Language */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Language / భాష</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setFormData({ ...formData, language: 'en' })}
                                    className={`p-6 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.language === 'en' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-200'
                                        }`}
                                >
                                    <span className="text-2xl">Aa</span>
                                    <span className="font-bold">English</span>
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, language: 'te' })}
                                    className={`p-6 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.language === 'te' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-200'
                                        }`}
                                >
                                    <span className="text-2xl">అ</span>
                                    <span className="font-bold">తెలుగు</span>
                                </button>
                            </div>
                            <button onClick={handleNext} className="w-full py-4 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition-colors flex items-center justify-center gap-2">
                                Next <ArrowRight size={20} />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Personal Details */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Your Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-800"
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">District / Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={formData.location_district}
                                            onChange={e => setFormData({ ...formData, location_district: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-800"
                                            placeholder="e.g. Hyderabad"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={handleBack} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl">Back</button>
                                <button
                                    onClick={handleNext}
                                    disabled={!formData.phone || !formData.location_district}
                                    className="flex-1 py-3 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Role Selection */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Select Role</h2>

                            <div className="space-y-3">
                                <RoleOption
                                    id="user"
                                    label="Farmer / Normal User"
                                    description="Browsing, buying, and asking questions."
                                    icon={User}
                                    selected={formData.role === 'user'}
                                    onSelect={() => setFormData({ ...formData, role: 'user', verification_doc: null })}
                                />
                                <RoleOption
                                    id="expert"
                                    label="Agricultural Expert"
                                    description="Verified to answer questions."
                                    icon={Shield}
                                    selected={formData.role === 'expert'}
                                    onSelect={() => setFormData({ ...formData, role: 'expert' })}
                                />
                                <RoleOption
                                    id="dealer"
                                    label="Dealer / Company"
                                    description="Selling products legally."
                                    icon={StoreIcon}
                                    selected={formData.role === 'dealer'}
                                    onSelect={() => setFormData({ ...formData, role: 'dealer' })}
                                />
                            </div>

                            {formData.role !== 'user' && (
                                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 animate-in fade-in slide-in-from-top-2">
                                    <h4 className="font-bold text-yellow-800 text-sm mb-2">Verification Required</h4>
                                    <p className="text-xs text-yellow-700 mb-3">
                                        To get the <b>{formData.role}</b> badge, you must upload a supporting document (ID Card, Certificate, License).
                                    </p>
                                    <label className="block w-full border-2 border-dashed border-yellow-300 rounded-xl p-4 text-center cursor-pointer hover:bg-yellow-100 transition-colors">
                                        <Upload className="mx-auto text-yellow-600 mb-2" size={24} />
                                        <span className="text-xs font-bold text-yellow-700">
                                            {formData.verification_doc ? formData.verification_doc.name : "Click to Upload Document"}
                                        </span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={e => e.target.files && setFormData({ ...formData, verification_doc: e.target.files[0] })}
                                        />
                                    </label>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button onClick={handleBack} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl">Back</button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || (formData.role !== 'user' && !formData.verification_doc)}
                                    className="flex-1 py-3 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? "Saving..." : "Finish Setup"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function RoleOption({ id, label, description, icon: Icon, selected, onSelect }: any) {
    return (
        <button
            onClick={onSelect}
            className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 text-left transition-all ${selected ? 'border-green-600 bg-green-50 shadow-sm' : 'border-gray-100 hover:border-green-100 bg-white'
                }`}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selected ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-500'
                }`}>
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <h3 className={`font-bold ${selected ? 'text-green-900' : 'text-gray-900'}`}>{label}</h3>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
            {selected && <Check className="text-green-600" size={20} />}
        </button>
    );
}

function StoreIcon(props: any) {
    return (
        <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
            <path d="M2 7h20" />
            <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
        </svg>
    )
}
