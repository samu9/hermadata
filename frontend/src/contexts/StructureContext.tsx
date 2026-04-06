import React, { createContext, useContext, useEffect, useState } from "react"
import { Structure } from "../models/structure.schema"
import { useStructuresQuery } from "../queries"

interface StructureContextType {
    structures: Structure[]
    currentStructure: Structure | null
    setCurrentStructure: (structure: Structure) => void
    isLoading: boolean
}

const StructureContext = createContext<StructureContextType | undefined>(
    undefined
)

const STRUCTURE_STORAGE_KEY = "currentStructure"

export const StructureProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [currentStructure, setCurrentStructureState] =
        useState<Structure | null>(null)

    const { data: structures = [], isLoading } = useStructuresQuery()

    useEffect(() => {
        if (structures.length > 0 && !currentStructure) {
            const stored = localStorage.getItem(STRUCTURE_STORAGE_KEY)
            if (stored) {
                try {
                    const parsed = JSON.parse(stored) as Structure
                    const found = structures.find((s) => s.id === parsed.id)
                    if (found) {
                        setCurrentStructureState(found)
                        return
                    }
                } catch {
                    // ignore parse errors
                }
            }
            setCurrentStructureState(structures[0])
            localStorage.setItem(
                STRUCTURE_STORAGE_KEY,
                JSON.stringify(structures[0])
            )
        }
    }, [structures])

    const setCurrentStructure = (structure: Structure) => {
        setCurrentStructureState(structure)
        localStorage.setItem(
            STRUCTURE_STORAGE_KEY,
            JSON.stringify(structure)
        )
    }

    return (
        <StructureContext.Provider
            value={{
                structures,
                currentStructure,
                setCurrentStructure,
                isLoading,
            }}
        >
            {children}
        </StructureContext.Provider>
    )
}

export const useStructure = (): StructureContextType => {
    const context = useContext(StructureContext)
    if (context === undefined) {
        throw new Error(
            "useStructure must be used within a StructureProvider"
        )
    }
    return context
}
