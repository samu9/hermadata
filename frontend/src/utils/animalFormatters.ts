import { differenceInYears, differenceInMonths, differenceInDays, parseISO } from "date-fns"

/**
 * Calculate age from birth date
 * Returns a formatted age string like "2 anni, 3 mesi" or "6 mesi" or "15 giorni"
 */
export const calculateAge = (birthDate: string | null | undefined): string => {
    if (!birthDate) return "-"
    
    const birth = parseISO(birthDate)
    const now = new Date()
    
    const years = differenceInYears(now, birth)
    const months = differenceInMonths(now, birth) % 12
    const days = differenceInDays(now, birth) % 30 // Approximate
    
    if (years > 0) {
        if (months > 0) {
            return `${years} ${years === 1 ? 'anno' : 'anni'}, ${months} ${months === 1 ? 'mese' : 'mesi'}`
        }
        return `${years} ${years === 1 ? 'anno' : 'anni'}`
    }
    
    if (months > 0) {
        return `${months} ${months === 1 ? 'mese' : 'mesi'}`
    }
    
    if (days > 0) {
        return `${days} ${days === 1 ? 'giorno' : 'giorni'}`
    }
    
    return "Appena nato"
}

/**
 * Format sex from numeric value to Italian text
 * 0 = Maschio, 1 = Femmina
 */
export const formatSex = (sex: number | null | undefined): string => {
    if (sex === null || sex === undefined) return "-"
    return sex === 0 ? "Maschio" : "Femmina"
}

/**
 * Format sterilization status
 */
export const formatSterilized = (sterilized: boolean | null | undefined): string => {
    if (sterilized === null || sterilized === undefined) return "-"
    return sterilized ? "Sì" : "No"
}

/**
 * Get label from a list of utility items by ID
 */
export const getLabelFromUtilItems = (
    items: Array<{ id: number; label: string }> | undefined,
    id: number | null | undefined
): string => {
    if (!items || id === null || id === undefined) return "-"
    const item = items.find(item => item.id === id)
    return item?.label || "-"
}

/**
 * Format chip code - show with proper formatting or indicate if not set
 */
export const formatChipCode = (chipCode: string | null | undefined, chipCodeSet: boolean): string => {
    if (!chipCodeSet) return "Non assegnato"
    if (!chipCode) return "Da assegnare"
    return chipCode
}

/**
 * Format entry/exit type from map
 */
export const formatTypeFromMap = (
    typeMap: { [key: string]: string } | undefined,
    type: string | null
): string => {
    if (!typeMap || !type) return "-"
    return typeMap[type] || type
}

/**
 * Get breed name from breeds list by ID
 */
export const getBreedName = (
    breeds: Array<{ id: number; name: string }> | undefined,
    breedId: number | null | undefined
): string => {
    if (!breeds || breedId === null || breedId === undefined) return "-"
    const breed = breeds.find(breed => breed.id === breedId)
    return breed?.name || "-"
}