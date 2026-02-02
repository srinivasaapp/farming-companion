"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Video, Loader2, Play } from "lucide-react";

interface MediaUploaderProps {
    onFileSelect: (file: File | null) => void;
    accept?: "image" | "video" | "both";
    label?: string;
    showPreview?: boolean;
}

export function MediaUploader({ onFileSelect, accept = "both", label = "Upload Media", showPreview = true }: MediaUploaderProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<"image" | "video" | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (!file) return;

        // Validate Type
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (accept === "image" && !isImage) return alert("Only images are allowed");
        if (accept === "video" && !isVideo) return alert("Only videos are allowed");
        if (accept === "both" && !isImage && !isVideo) return alert("Only images or videos are allowed");

        // Create Preview
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setFileType(isImage ? "image" : "video");
        onFileSelect(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const clearFile = () => {
        setPreviewUrl(null);
        setFileType(null);
        onFileSelect(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const acceptString = accept === "image" ? "image/*" : accept === "video" ? "video/*" : "image/*,video/*";

    return (
        <div className="w-full">
            {showPreview && previewUrl ? (
                <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-gray-200 group">
                    {fileType === "image" ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                        <video src={previewUrl} className="w-full h-full object-contain" controls />
                    )}

                    <button
                        type="button"
                        onClick={clearFile}
                        className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    >
                        <X size={16} />
                    </button>

                    <div className="absolute bottom-2 left-2 px-3 py-1 bg-black/50 rounded-full text-white text-xs font-medium capitalize">
                        {fileType} selected
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`
                        min-h-[160px] w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all
                        ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
                    `}
                >
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        {accept === "image" && <ImageIcon size={24} />}
                        {accept === "video" && <Video size={24} />}
                        {accept === "both" && <Upload size={24} />}
                    </div>

                    <div className="text-center">
                        <p className="font-bold text-gray-700">{label}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {accept === "image" && "JPG, PNG, WEBP supported"}
                            {accept === "video" && "MP4, MOV supported (Max 1min)"}
                            {accept === "both" && "Images or Videos"}
                        </p>
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={acceptString}
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
        </div>
    );
}
