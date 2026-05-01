import { useEffect, useState } from "react"

export function useSessionStorage<T>(
    key: string,
    initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        try {
            const stored = sessionStorage.getItem(key)
            return stored !== null ? (JSON.parse(stored) as T) : initialValue
        } catch {
            return initialValue
        }
    })

    useEffect(() => {
        try {
            sessionStorage.setItem(key, JSON.stringify(value))
        } catch {
            // sessionStorage unavailable or full
        }
    }, [key, value])

    return [value, setValue]
}
