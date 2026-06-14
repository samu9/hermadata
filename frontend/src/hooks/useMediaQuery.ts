import { useEffect, useState } from "react"

/**
 * SSR-safe media query hook. Returns whether the given query currently matches
 * and updates on viewport changes.
 */
export const useMediaQuery = (query: string): boolean => {
    const getMatch = () =>
        typeof window !== "undefined" && "matchMedia" in window
            ? window.matchMedia(query).matches
            : false

    const [matches, setMatches] = useState(getMatch)

    useEffect(() => {
        if (typeof window === "undefined" || !("matchMedia" in window)) return

        const mql = window.matchMedia(query)
        const handler = (e: MediaQueryListEvent) => setMatches(e.matches)

        // Sync in case the query changed between render and effect.
        setMatches(mql.matches)
        mql.addEventListener("change", handler)
        return () => mql.removeEventListener("change", handler)
    }, [query])

    return matches
}

/**
 * True below the `lg` breakpoint (1024px) — i.e. phones and tablets, where the
 * mobile drawer / stacked layouts apply. Mirrors Tailwind's `lg` breakpoint.
 */
export const useIsMobile = (): boolean =>
    !useMediaQuery("(min-width: 1024px)")
