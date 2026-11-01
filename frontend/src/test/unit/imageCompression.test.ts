import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
    calculateTargetDimensions,
    compressImage,
    replaceFileExtension,
} from "../../utils/imageCompression"

describe("imageCompression utilities", () => {
    describe("calculateTargetDimensions", () => {
        it("keeps original dimensions when within maxDimension", () => {
            expect(calculateTargetDimensions(800, 600, 1280)).toEqual({
                width: 800,
                height: 600,
            })
        })

        it("scales down landscape images preserving aspect ratio", () => {
            expect(calculateTargetDimensions(4000, 3000, 1280)).toEqual({
                width: 1280,
                height: 960,
            })
        })

        it("scales down portrait images preserving aspect ratio", () => {
            expect(calculateTargetDimensions(3000, 4000, 1280)).toEqual({
                width: 960,
                height: 1280,
            })
        })
    })

    describe("replaceFileExtension", () => {
        it("replaces existing extension with matching mime extension", () => {
            expect(replaceFileExtension("dog.JPG", "image/webp")).toBe(
                "dog.webp",
            )
            expect(replaceFileExtension("cat.photo.png", "image/jpeg")).toBe(
                "cat.photo.jpg",
            )
        })

        it("appends extension when filename has no extension", () => {
            expect(replaceFileExtension("avatar", "image/webp")).toBe(
                "avatar.webp",
            )
        })
    })

    describe("compressImage", () => {
        const originalImage = globalThis.Image
        const originalCreateObjectURL = URL.createObjectURL
        const originalRevokeObjectURL = URL.revokeObjectURL
        let mockWidth = 4000
        let mockHeight = 3000
        let shouldFailImageLoad = false
        let toBlobImpl: (
            cb: BlobCallback,
            type?: string,
            quality?: number,
        ) => void
        let drawImageSpy: ReturnType<typeof vi.fn>

        beforeEach(() => {
            mockWidth = 4000
            mockHeight = 3000
            shouldFailImageLoad = false
            drawImageSpy = vi.fn()

            URL.createObjectURL = vi.fn(() => "blob:mock-url")
            URL.revokeObjectURL = vi.fn()

            class MockImage {
                naturalWidth = mockWidth
                naturalHeight = mockHeight
                width = mockWidth
                height = mockHeight
                onload: (() => void) | null = null
                onerror: (() => void) | null = null
                set src(_val: string) {
                    setTimeout(() => {
                        if (shouldFailImageLoad) {
                            this.onerror?.()
                        } else {
                            this.onload?.()
                        }
                    }, 0)
                }
            }
            globalThis.Image = MockImage as unknown as typeof Image

            toBlobImpl = (cb, type = "image/webp") => {
                cb(new Blob(["compressed"], { type }))
            }

            vi.spyOn(
                HTMLCanvasElement.prototype,
                "getContext",
            ).mockReturnValue({
                drawImage: drawImageSpy,
            } as unknown as CanvasRenderingContext2D)

            vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
                function (cb, type, quality) {
                    toBlobImpl(cb, type, quality)
                },
            )
        })

        afterEach(() => {
            globalThis.Image = originalImage
            URL.createObjectURL = originalCreateObjectURL
            URL.revokeObjectURL = originalRevokeObjectURL
            vi.restoreAllMocks()
        })

        it("resizes a large image and converts it to WebP", async () => {
            const rawContent = new Uint8Array(500_000)
            const input = new File([rawContent], "IMG_1234.JPG", {
                type: "image/jpeg",
            })

            const output = await compressImage(input)

            expect(drawImageSpy).toHaveBeenCalledWith(
                expect.anything(),
                0,
                0,
                1280,
                960,
            )
            expect(output.name).toBe("IMG_1234.webp")
            expect(output.type).toBe("image/webp")
            expect(output.size).toBeLessThan(input.size)
            expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url")
        })

        it("falls back to JPEG if browser does not support WebP encoding", async () => {
            toBlobImpl = (cb, type) => {
                if (type === "image/webp") {
                    // Simulate browser ignoring image/webp and returning image/png
                    cb(new Blob(["png-fallback"], { type: "image/png" }))
                } else {
                    cb(new Blob(["jpeg-fallback"], { type: "image/jpeg" }))
                }
            }

            const input = new File([new Uint8Array(100_000)], "photo.png", {
                type: "image/png",
            })

            const output = await compressImage(input)

            expect(output.type).toBe("image/jpeg")
            expect(output.name).toBe("photo.jpg")
        })

        it("returns original file if not resized and compressed blob is larger", async () => {
            mockWidth = 400
            mockHeight = 400
            toBlobImpl = (cb, type) => {
                cb(new Blob([new Uint8Array(2000)], { type }))
            }

            const input = new File([new Uint8Array(500)], "tiny.jpg", {
                type: "image/jpeg",
            })

            const output = await compressImage(input)

            expect(output).toBe(input)
        })

        it("passes SVG files through untouched", async () => {
            const svg = new File(["<svg></svg>"], "icon.svg", {
                type: "image/svg+xml",
            })
            const output = await compressImage(svg)
            expect(output).toBe(svg)
        })
    })
})
