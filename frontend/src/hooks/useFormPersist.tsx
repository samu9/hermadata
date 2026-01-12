import { useEffect } from "react"
import { UseFormReturn } from "react-hook-form"

interface FormPersistOptions {
    ttl?: number // Time to live in milliseconds
    exclude?: string[] // Fields to exclude from persistence
}

export const useFormPersist = <T extends Record<string, any>>(
    key: string,
    methods: UseFormReturn<T>,
    options: FormPersistOptions = {}
) => {
    const { ttl = 30 * 60 * 1000, exclude = [] } = options // Default 30 minutes
    const { watch, reset, getValues } = methods

    // Load from storage on mount
    useEffect(() => {
        const stored = localStorage.getItem(key)
        if (stored) {
            try {
                // Custom reviver to handle Date objects
                const parsed = JSON.parse(stored, (_key, value) => {
                    // Check for ISO 8601 date strings (simplified regex)
                    if (
                        typeof value === "string" &&
                        /^\d{4}-\d{2}-\d{2}T/.test(value)
                    ) {
                        const d = new Date(value)
                        return isNaN(d.getTime()) ? value : d
                    }
                    return value
                })

                const { timestamp, data } = parsed
                const now = Date.now()

                if (now - timestamp < ttl) {
                    console.log("[useFormPersist] Restoring data:", data)
                    const currentValues = getValues()
                    reset({ ...currentValues, ...data })
                } else {
                    console.log("[useFormPersist] Data expired")
                    localStorage.removeItem(key)
                }
            } catch (e) {
                console.error("Failed to parse stored form data", e)
                localStorage.removeItem(key)
            }
        } else {
            console.log("[useFormPersist] No stored data for key:", key)
        }
    }, [key, reset, ttl]) // eslint-disable-line react-hooks/exhaustive-deps

    // Save to storage on change
    useEffect(() => {
        const subscription = watch((value) => {
            // console.log("[useFormPersist] Saving data:", value)
            const dataToSave = { ...value }
            exclude.forEach((field) => delete dataToSave[field])

            const storageData = {
                timestamp: Date.now(),
                data: dataToSave,
            }

            localStorage.setItem(key, JSON.stringify(storageData))
        })
        return () => subscription.unsubscribe()
    }, [key, watch, exclude])

    // Function to clear storage (e.g. on successful submit)
    const clearStorage = () => {
        localStorage.removeItem(key)
    }

    return { clearStorage }
}
