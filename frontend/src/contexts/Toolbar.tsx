import React, { createContext, useContext, useState, ReactNode } from "react"

type ToolbarButton = {
    id: string
    buttonText: string
    buttonIcon: any // Use the appropriate FontAwesomeIcon type
    FormComponent: React.ComponentType<{ onSuccess: (data: any) => void }>
    onSuccessAction: (data: any) => void
}

type ToolbarContextType = {
    buttons: ToolbarButton[]
    addButton: (button: ToolbarButton) => void
    removeButton: (id: string) => void
}

const ToolbarContext = createContext<ToolbarContextType | undefined>(undefined)

export const ToolbarProvider = ({ children }: { children: ReactNode }) => {
    const [buttons, setButtons] = useState<ToolbarButton[]>([])

    const addButton = (button: ToolbarButton) => {
        setButtons((prev) => {
            const exists = prev.some((b) => b.id === button.id)
            if (exists) {
                return prev // Do not add a button with a duplicate ID
            }
            return [...prev, button]
        })
    }

    const removeButton = (id: string) => {
        setButtons((prev) => prev.filter((button) => button.id !== id))
    }

    return (
        <ToolbarContext.Provider value={{ buttons, addButton, removeButton }}>
            {children}
        </ToolbarContext.Provider>
    )
}

export const useToolbar = () => {
    const context = useContext(ToolbarContext)
    if (!context) {
        throw new Error("useToolbar must be used within a ToolbarProvider")
    }
    return context
}
