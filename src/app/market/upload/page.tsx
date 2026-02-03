"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Tag, Loader2, MapPin } from "lucide-react";
import { MediaUploader } from "@/components/common/MediaUploader";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";

export default function UploadMarketPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    // State
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [unit, setUnit] = useState("kg");
    const [location, setLocation] = useState("");
    const [desc, setDesc] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) throw new Error("Login required");

            const { uploadImage, createListing } = await import("@/lib/services/api");
            const { compressImage } = await import("@/lib/utils/image");

            let imageUrl = undefined;
            if (file) {
                const compressedFile = await compressImage(file);
                imageUrl = await uploadImage(compressedFile, 'listings');
            }

            await createListing({
                title,
                price: Number(price),
                price_unit: unit,
                location_text: location,
                description: desc,
                type: 'sell', // Defaulting to sell for this simplified page, or add selector
                author_id: user.id,
                image_url: imageUrl
            });

            showToast("Item Listed Successfully!", "success");
            setTimeout(() => {
                router.push("/market");
                router.refresh();
            }, 1500);
        } catch (err: any) {
            console.error("Market post failed", err);
            showToast(err.message || "Failed to list item", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white px-4 py-3 border-b border-gray-100 sticky top-0 z-30 flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Sell Item</h1>
            </div>

            <form onSubmit={handleUpload} className="p-4 space-y-6 max-w-lg mx-auto">
                {/* Media Upload */}
                <MediaUploader
                    onFileSelect={(f) => setFile(f)}
                    accept="both"
                    label="Add Photos or Video of Item"
                />

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-900 bg-white"
                            placeholder="e.g. Tractor 45HP"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-900 bg-white"
                                placeholder="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Unit</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-900"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                            >
                                <option value="Fixed Price">Fixed Price</option>
                                <option value="kg">Per Kg</option>
                                <option value="quintal">Per Quintal</option>
                                <option value="hour">Per Hour</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                        <div className="relative">
                            <MapPin size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-900 bg-white"
                                placeholder="Your District/Mandal"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 h-32 resize-none text-gray-900 bg-white"
                            placeholder="Condition, age, specifications..."
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Listing...
                        </>
                    ) : (
                        <>
                            <Tag size={20} />
                            List for Sale
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
