export function getOptimizedImageUrl(url: string | null | undefined, width = 500): string {
    if (!url) return "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=500"; // Fallback placeholder

    // Check if it's a Supabase Storage URL
    if (url.includes('supabase.co/storage/v1/object/public')) {
        // Append transformation params
        // Check if params already exist
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}width=${width}&resize=cover&quality=80`;
    }

    return url;
}

/**
 * Compresses an image file using HTMLCanvasElement.
 * @param file The original image file.
 * @param options Configuration for compression (maxWidth, quality).
 * @returns A Promise that resolves to the compressed File object.
 */
export async function compressImage(file: File, options: { maxWidth?: number; quality?: number } = {}): Promise<File> {
    const { maxWidth = 1920, quality = 0.8 } = options;

    // Reject if not an image
    if (!file.type.startsWith('image/')) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize if needed
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Failed to get canvas context"));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error("Canvas to Blob failed"));
                            return;
                        }
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}
