import React from "react";
import styles from "./Badge.module.css";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "primary" | "warning" | "error" | "success" | "expert";
    size?: "sm" | "md";
    className?: string;
}

export function Badge({ children, variant = "default", size = "md", className = "" }: BadgeProps) {
    return (
        <span className={`${styles.badge} ${styles[variant]} ${size === "sm" ? styles.sm : ""} ${className}`}>
            {children}
        </span>
    );
}
