/**
 * Edge-to-edge ("full bleed") blocks on mobile, so wide tables get the whole
 * screen width. Nothing here applies from the `lg` breakpoint up.
 */

/**
 * Stretches a block across PageWrapper's horizontal padding (`p-6 md:p-8`).
 * Keep in sync with that padding.
 */
export const MOBILE_FULL_BLEED = "-mx-6 md:-mx-8 lg:mx-0"

/** A card that bleeds to the screen edges, without side borders or corners. */
export const MOBILE_FULL_BLEED_CARD = `${MOBILE_FULL_BLEED} max-lg:!rounded-none max-lg:border-x-0`
