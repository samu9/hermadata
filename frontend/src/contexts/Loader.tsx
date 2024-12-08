import React, { createContext, useState, useContext, ReactNode } from "react"

interface LoaderContextProps {
    loading: boolean
    startLoading: () => void
    stopLoading: () => void
}

const LoaderContext = createContext<LoaderContextProps | undefined>(undefined)

interface LoaderProviderProps {
    children: ReactNode
}

export const LoaderProvider: React.FC<LoaderProviderProps> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(false)

    const startLoading = () => setLoading(true)
    const stopLoading = () => setLoading(false)

    return (
        <LoaderContext.Provider value={{ loading, startLoading, stopLoading }}>
            {children}
        </LoaderContext.Provider>
    )
}

export const useLoader = (): LoaderContextProps => {
    const context = useContext(LoaderContext)
    if (!context) {
        throw new Error("useLoader must be used within a LoaderProvider")
    }
    return context
}
