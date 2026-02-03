"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./page.module.css";
import { FeedHeader, UserRole } from "@/components/common/FeedHeader";
import {
    MapPin, Phone, MessageSquare, Plus,
    ShieldCheck, Star, Filter, Loader2, AlertCircle, RefreshCcw, Camera, Image as ImageIcon, Trash2
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getListings, createListing, uploadImage, deleteListing } from "@/lib/services/api";
import { X } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/utils/image";
import { useToast } from "@/components/providers/ToastProvider";

interface Listing {
    id: string;
    title: string;
    price: number;
    price_unit: string;
    location_text: string;
    type: "buy" | "sell" | "rent";
    image_url: string | null;
    author_id: string;
    profiles?: {
        full_name: string;
        role: string;
        is_verified: boolean;
        stats: any;
    };
}

export default function MarketPage() {
    const { t } = useLanguage();
    const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
    const [activeTab, setActiveTab] = useState<"buy" | "sell" | "rent">("buy");
    const { user, setShowLoginModal } = useAuth();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null);
    const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
    const [showNearMe, setShowNearMe] = useState(false);

    // Filter Modal
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [priceRange, setPriceRange] = useState<{ min?: number, max?: number }>({});

    const [showPostModal, setShowPostModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [newTitle, setNewTitle] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [newUnit, setNewUnit] = useState("kg");
    const [newLocation, setNewLocation] = useState("");
    const [newType, setNewType] = useState<"buy" | "sell" | "rent">("sell");
    const [newDesc, setNewDesc] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setPageError(null);
        try {
            // Determine Location for "Near Me"
            let userLocation = undefined;
            if (showNearMe) {
                // Try to get from WeatherWidget storage
                const savedLoc = localStorage.getItem('user_location_weather');
                if (savedLoc) {
                    const parsed = JSON.parse(savedLoc);
                    // Extract city name or use raw name. 
                    // Example name: "Hyderabad, Telangana" -> "Hyderabad"
                    userLocation = parsed.name?.split(',')[0];
                }
            }

            const data = await getListings(activeTab, 0, 50, { // Increased limit
                verifiedOnly: showVerifiedOnly,
                nearLocation: userLocation,
                minPrice: priceRange.min,
                maxPrice: priceRange.max
            });
            setListings(data as any);
        } catch (err: any) {
            console.error("MarketPage: Failed to load listings:", err.message || err);
            setPageError(err.message || "Failed to load marketplace listings.");
        }
        setLoading(false);
    }, [activeTab, showVerifiedOnly, showNearMe, priceRange]); // Depend on filter states

    useEffect(() => {
        loadData();
    }, [loadData]);


    const handleCreate = () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        setShowPostModal(true);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const { showToast } = useToast();
    const [listingToDelete, setListingToDelete] = useState<string | null>(null);

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setListingToDelete(id);
    };

    const confirmDelete = async () => {
        if (!listingToDelete) return;
        try {
            await deleteListing(listingToDelete);
            // Optimistic update
            setListings(prev => prev.filter(l => l.id !== listingToDelete));
            showToast("Listing deleted", "success");
            setListingToDelete(null);
        } catch (err) {
            console.error("Failed to delete", err);
            showToast("Failed to delete", "error");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!newTitle.trim() || !newPrice || !newLocation.trim()) return;

        setIsSubmitting(true);
        try {
            let imageUrl = undefined;
            if (selectedImage) {
                try {
                    imageUrl = await uploadImage(selectedImage, 'listings');
                } catch (uploadErr) {
                    console.error("Image upload failed:", uploadErr);
                    // Decide if we want to stop or continue without image
                }
            }

            await createListing({
                title: newTitle,
                description: newDesc,
                price: Number(newPrice),
                price_unit: newUnit,
                location_text: newLocation,
                type: newType,
                author_id: user.id,
                image_url: imageUrl
            });
            setNewTitle("");
            setNewPrice("");
            setNewLocation("");
            setNewDesc("");
            setSelectedImage(null);
            setPreviewUrl(null);
            setShowPostModal(false);

            // If we posted in the current active tab category, refresh
            if (newType === activeTab) {
                loadData();
            } else {
                setActiveTab(newType); // Switch to the category we just posted in
            }
        } catch (err: any) {
            console.error("MarketPage: Failed to post listing:", err);
            alert("Failed to post listing. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <FeedHeader
                title={t('nav_market')}
                uploadPath="/market/upload"
                selectedRoles={selectedRoles}
                onRoleChange={setSelectedRoles}
            />

            {/* Sub-navigation & Actions */}
            <div className="sticky top-[58px] z-40 bg-gray-50/95 backdrop-blur-sm px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <div className="flex bg-gray-200 p-1 rounded-lg">
                    {(["buy", "sell", "rent"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${activeTab === tab
                                ? "bg-white text-green-700 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {t(tab)}
                        </button>
                    ))}
                </div>
            </div>


            <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
                <button
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${showVerifiedOnly ? 'bg-green-100 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-600'}`}
                    onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                >
                    <ShieldCheck size={14} /> {t('market_verified_only') || "Verified Only"}
                </button>
                <button
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${showNearMe ? 'bg-green-100 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-600'}`}
                    onClick={() => setShowNearMe(!showNearMe)}
                >
                    <MapPin size={14} /> {t('market_near_me') || "Near Me"}
                </button>
                <button
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${(priceRange.min !== undefined || priceRange.max !== undefined) ? 'bg-green-100 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-600'}`}
                    onClick={() => setShowFilterModal(true)}
                >
                    <Filter size={14} /> {t('market_filters') || "Price Filters"}
                </button>
            </div>

            {/* Price Filter Modal at bottom of render */}
            {showFilterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl relative">
                        <h3 className="text-lg font-bold mb-4">Filter by Price</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg px-3 py-2"
                                    placeholder="0"
                                    value={priceRange.min || ''}
                                    onChange={e => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg px-3 py-2"
                                    placeholder="Any"
                                    value={priceRange.max || ''}
                                    onChange={e => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => { setPriceRange({}); setShowFilterModal(false); }}
                                    className="flex-1 py-2 text-gray-500 font-medium"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => setShowFilterModal(false)}
                                    className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                        <button onClick={() => setShowFilterModal(false)} className="absolute top-4 right-4 text-gray-400">
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-20">
                {loading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12">
                        <Loader2 size={32} className="animate-spin text-green-600 mb-2" />
                        <p className="text-gray-400 text-sm">{t('generic_loading')}</p>
                    </div>
                ) : pageError ? (
                    <div className="col-span-full text-center py-12 bg-red-50 rounded-xl border border-red-100">
                        <AlertCircle size={32} className="mx-auto text-red-500 mb-2" />
                        <h3 className="font-bold text-red-700">Error Loading Market</h3>
                        <p className="text-sm text-red-600 mb-4">{pageError}</p>
                        <button
                            onClick={loadData}
                            className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium"
                        >
                            Retry
                        </button>
                    </div>
                ) : (listings.filter(item => selectedRoles.length === 0 || selectedRoles.includes(item.profiles?.role as UserRole))).length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <MapPin size={24} className="opacity-40" />
                        </div>
                        <p>{t('market_no_results') || 'No items found matching criteria.'}</p>
                        {(showVerifiedOnly || showNearMe || priceRange.min || priceRange.max) && (
                            <button onClick={() => { setShowVerifiedOnly(false); setShowNearMe(false); setPriceRange({}) }} className="text-green-600 text-sm font-medium mt-2 underline">
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    listings.filter(item => selectedRoles.length === 0 || selectedRoles.includes(item.profiles?.role as UserRole)).map((item) => {
                        const sellerType = item.profiles?.role === 'expert' ? t('profile_expert') : (item.profiles?.is_verified ? t('ask_solved') : 'Community');
                        return (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                <div className="relative h-48 bg-gray-100">
                                    <img
                                        src={getOptimizedImageUrl(item.image_url, 400)}
                                        alt={item.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${item.profiles?.role === 'expert' ? 'bg-green-600 text-white' : 'bg-white/90 text-gray-700'}`}>
                                        {item.profiles?.role === 'expert' && <Star size={10} fill="currentColor" />}
                                        {sellerType}
                                    </div>
                                </div>
                                <div className="p-3 flex flex-col flex-1">
                                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{item.title}</h3>
                                    <div className="text-lg font-bold text-green-700 mb-3">₹{item.price} <span className="text-xs font-normal text-gray-500">/ {item.price_unit}</span></div>

                                    <div className="mt-auto flex gap-2">
                                        <button className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold flex items-center justify-center gap-1 hover:bg-green-100">
                                            <MessageSquare size={16} /> {t('market_chat')}
                                        </button>
                                        <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold flex items-center justify-center gap-1 hover:bg-gray-200">
                                            <Phone size={16} /> {t('market_call')}
                                        </button>
                                        {user && user.id === item.author_id && (
                                            <button
                                                className="p-2 bg-red-50 text-red-500 rounded-lg border border-red-100 hover:bg-red-100"
                                                onClick={(e) => handleDelete(e, item.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Post Listing Modal */}
            {showPostModal && (
                <div className={styles.modalOverlay} onClick={() => setShowPostModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>{t('market_post_listing')}</h2>
                            <button className={styles.closeBtn} onClick={() => setShowPostModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>{t('market_item_title') || 'Item Title'}</label>
                                <input
                                    className={styles.input}
                                    placeholder="e.g. Fresh Wheat, Tractor for Rent"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('market_price') || 'Price (₹)'}</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        placeholder="0"
                                        value={newPrice}
                                        onChange={e => setNewPrice(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('market_unit') || 'Unit'}</label>
                                    <select
                                        className={styles.select}
                                        value={newUnit}
                                        onChange={e => setNewUnit(e.target.value)}
                                    >
                                        <option value="kg">kg</option>
                                        <option value="quintal">quintal</option>
                                        <option value="acre">acre</option>
                                        <option value="hour">hour</option>
                                        <option value="day">day</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>{t('market_location') || 'Location'}</label>
                                <input
                                    className={styles.input}
                                    placeholder="e.g. Guntur, Andhra Pradesh"
                                    value={newLocation}
                                    onChange={e => setNewLocation(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>{t('market_category') || 'Category'}</label>
                                <select
                                    className={styles.select}
                                    value={newType}
                                    onChange={e => setNewType(e.target.value as any)}
                                >
                                    <option value="sell">{t('market_tab_sell')}</option>
                                    <option value="buy">{t('market_tab_buy')}</option>
                                    <option value="rent">{t('market_tab_rent')}</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>{t('market_desc_label') || 'Description'}</label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Details about quality, variety, etc."
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Photo (Optional)</label>
                                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '12px',
                                            border: '2px dashed #E5E7EB',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#6B7280',
                                            cursor: 'pointer',
                                            flexShrink: 0
                                        }}
                                    >
                                        <Camera size={24} />
                                        <span style={{ fontSize: '10px', marginTop: '4px' }}>Add</span>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                    {previewUrl && (
                                        <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { setSelectedImage(null); setPreviewUrl(null); }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '-6px',
                                                    right: '-6px',
                                                    background: '#EF4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '20px',
                                                    height: '20px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={isSubmitting || !newTitle.trim() || !newPrice || !newLocation.trim()}
                            >
                                {isSubmitting ? t('generic_loading') : t('market_post_listing')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {listingToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setListingToDelete(null)}>
                    <div className="bg-white rounded-2xl p-6 w-[85%] max-w-sm shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Listing?</h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            Are you sure you want to delete this listing? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setListingToDelete(null)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
