import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";

export interface ShareOptions {
    title: string;
    text: string;
    url?: string;
    dialogTitle?: string;
}

export const shareContent = async (options: ShareOptions): Promise<void> => {
    const shareData = {
        title: options.title,
        text: options.text,
        url: options.url || window.location.href,
        dialogTitle: options.dialogTitle || 'Share with farmers',
    };

    try {
        if (Capacitor.isNativePlatform()) {
            await Share.share(shareData);
        } else if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Fallback for browsers without Web Share API
            await navigator.clipboard.writeText(shareData.url);
            alert("Link copied to clipboard!");
        }
    } catch (error) {
        // Build a proper error message string to avoid "Unknown error"
        let errorMessage = "Share failed";
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }

        const isCancellation = errorMessage.includes('AbortError') || errorMessage.includes('canceled');

        // Only log actual errors, not user cancellations
        if (!isCancellation) {
            console.error("Share failed:", errorMessage);

            try {
                await navigator.clipboard.writeText(shareData.url);
                alert("Link copied to clipboard!");
            } catch (clipboardError) {
                console.error("Clipboard fallback failed:", clipboardError);
                alert("Unable to share or copy link.");
            }
        }
    }
};
