export type CompressImageOptions = {
    maxDimension?: number
    quality?: number
    mimeType?: "image/webp" | "image/jpeg"
}

const DEFAULT_MAX_DIMENSION = 1280
const DEFAULT_QUALITY = 0.8
const DEFAULT_MIME_TYPE = "image/webp"

const EXTENSION_BY_MIME: Record<string, string> = {
    "image/webp": ".webp",
    "image/jpeg": ".jpg",
}

export const replaceFileExtension = (
    filename: string,
    mimeType: string,
): string => {
    const ext = EXTENSION_BY_MIME[mimeType] ?? ".webp"
    const dotIndex = filename.lastIndexOf(".")
    const baseName = dotIndex > 0 ? filename.slice(0, dotIndex) : filename
    return `${baseName}${ext}`
}

export const calculateTargetDimensions = (
    width: number,
    height: number,
    maxDimension: number,
): { width: number; height: number } => {
    if (width <= 0 || height <= 0) {
        return { width: maxDimension, height: maxDimension }
    }
    if (width <= maxDimension && height <= maxDimension) {
        return { width, height }
    }
    const scale = maxDimension / Math.max(width, height)
    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale)),
    }
}

const loadImage = (file: File): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file)
        const img = new Image()
        img.onload = () => {
            URL.revokeObjectURL(objectUrl)
            resolve(img)
        }
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl)
            reject(new Error("Failed to decode image"))
        }
        img.src = objectUrl
    })

const canvasToBlob = (
    canvas: HTMLCanvasElement,
    mimeType: string,
    quality: number,
): Promise<Blob | null> =>
    new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), mimeType, quality)
    })

/**
 * Resizes and compresses an image file on the client before uploading.
 * Scales down so the longest edge is at most `maxDimension` (default 1280px)
 * and encodes as WebP (falling back to JPEG if WebP encoding is unsupported).
 */
export const compressImage = async (
    file: File,
    options: CompressImageOptions = {},
): Promise<File> => {
    if (file.type === "image/svg+xml") {
        return file
    }

    const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION
    const quality = options.quality ?? DEFAULT_QUALITY
    const preferredMimeType = options.mimeType ?? DEFAULT_MIME_TYPE

    const img = await loadImage(file)
    const naturalWidth = img.naturalWidth || img.width
    const naturalHeight = img.naturalHeight || img.height
    const { width, height } = calculateTargetDimensions(
        naturalWidth,
        naturalHeight,
        maxDimension,
    )

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext("2d")
    if (!ctx) {
        return file
    }

    ctx.drawImage(img, 0, 0, width, height)

    let blob = await canvasToBlob(canvas, preferredMimeType, quality)
    let outputMimeType: string = preferredMimeType

    if (
        (!blob || blob.type !== preferredMimeType) &&
        preferredMimeType === "image/webp"
    ) {
        outputMimeType = "image/jpeg"
        blob = await canvasToBlob(canvas, outputMimeType, quality)
    }

    if (!blob) {
        return file
    }

    const wasResized = width !== naturalWidth || height !== naturalHeight
    if (!wasResized && blob.size >= file.size) {
        return file
    }

    const finalMimeType = blob.type || outputMimeType
    const newFilename = replaceFileExtension(file.name, finalMimeType)

    return new File([blob], newFilename, {
        type: finalMimeType,
        lastModified: Date.now(),
    })
}
