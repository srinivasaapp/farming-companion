"use client";

import React from "react";
import styles from "./AntiGravityCard.module.css";
import { Link2, Share2, MessageCircle, ThumbsUp } from "lucide-react";

interface AntiGravityCardProps {
    type?: "news" | "alert";
    image?: string;
    tag?: string;
    title?: string;
    points?: string[];
    sourceUrl?: string;
    children?: React.ReactNode;
    className?: string;
}

export function AntiGravityCard({
    type, image, tag, title, points,
    children, className = ""
}: AntiGravityCardProps) {

    // Simple Flat Implementation (No Physics)
    const bulletColor = type === "alert" ? "#EF4444" : "#10B981";

    return (
        <div className={`w-full bg-white rounded-xl border border-gray-200 overflow-hidden mb-4 ${className}`}>
            {children ? (
                children
            ) : (
                <>
                    <div className="relative h-48 w-full overflow-hidden">
                        {image && (
                            <img src={image} alt="Cover" className="w-full h-full object-cover" />
                        )}
                        {tag && (
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                {tag}
                            </div>
                        )}
                    </div>

                    <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            {title && <h2 className="text-lg font-bold text-gray-800 leading-tight">{title}</h2>}
                            <div className="bg-gray-100 p-1.5 rounded-full text-gray-500">
                                <Link2 size={16} />
                            </div>
                        </div>

                        {points && (
                            <ul className="space-y-2 mb-4">
                                {points.map((point: any, i) => (
                                    <li key={i} className="flex items-start text-sm text-gray-600">
                                        <span className="w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0" style={{ background: bulletColor }}></span>
                                        {typeof point === 'string' ? point : (point.text || point.content)}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="flex gap-2 pt-2 border-t border-gray-100 mt-2">
                            <button className="flex-1 py-2 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-lg">
                                <ThumbsUp size={18} />
                            </button>
                            <button className="flex-1 py-2 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-lg">
                                <MessageCircle size={18} />
                            </button>
                            <button className="flex-1 py-2 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-lg">
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
