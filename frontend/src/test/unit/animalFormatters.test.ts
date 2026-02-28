import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  calculateAge,
  formatSex,
  formatSterilized,
  getLabelFromUtilItems,
  formatChipCode,
  formatTypeFromMap,
  getBreedName,
} from '../../utils/animalFormatters'

describe('calculateAge', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns "-" for null birth date', () => {
    expect(calculateAge(null)).toBe('-')
  })

  it('returns "-" for undefined birth date', () => {
    expect(calculateAge(undefined)).toBe('-')
  })

  it('returns age in years for older animal', () => {
    // Mock current date to be 2 years after birth
    const birthDate = '2020-01-15'
    vi.setSystemTime(new Date('2022-06-15'))
    const result = calculateAge(birthDate)
    expect(result).toContain('anni')
    vi.useRealTimers()
  })

  it('returns age in months for young animal', () => {
    const birthDate = '2024-03-01'
    vi.setSystemTime(new Date('2024-09-15'))
    const result = calculateAge(birthDate)
    expect(result).toContain('mes')
    vi.useRealTimers()
  })

  it('returns "Appena nato" for very recent birth', () => {
    const today = new Date()
    const birthDate = today.toISOString().split('T')[0]
    vi.setSystemTime(today)
    const result = calculateAge(birthDate)
    expect(result).toBe('Appena nato')
    vi.useRealTimers()
  })

  it('uses singular "anno" for exactly 1 year', () => {
    vi.setSystemTime(new Date('2025-01-15'))
    const result = calculateAge('2024-01-15')
    expect(result).toContain('anno')
    vi.useRealTimers()
  })

  it('uses singular "mese" for exactly 1 month', () => {
    vi.setSystemTime(new Date('2024-02-15'))
    const result = calculateAge('2024-01-15')
    expect(result).toContain('mese')
    vi.useRealTimers()
  })
})

describe('formatSex', () => {
  it('returns "Maschio" for 0', () => {
    expect(formatSex(0)).toBe('Maschio')
  })

  it('returns "Femmina" for 1', () => {
    expect(formatSex(1)).toBe('Femmina')
  })

  it('returns "-" for null', () => {
    expect(formatSex(null)).toBe('-')
  })

  it('returns "-" for undefined', () => {
    expect(formatSex(undefined)).toBe('-')
  })
})

describe('formatSterilized', () => {
  it('returns "Sì" for true', () => {
    expect(formatSterilized(true)).toBe('Sì')
  })

  it('returns "No" for false', () => {
    expect(formatSterilized(false)).toBe('No')
  })

  it('returns "-" for null', () => {
    expect(formatSterilized(null)).toBe('-')
  })

  it('returns "-" for undefined', () => {
    expect(formatSterilized(undefined)).toBe('-')
  })
})

describe('getLabelFromUtilItems', () => {
  const items = [
    { id: 1, label: 'Piccolo' },
    { id: 2, label: 'Medio' },
    { id: 3, label: 'Grande' },
  ]

  it('returns label for matching id', () => {
    expect(getLabelFromUtilItems(items, 2)).toBe('Medio')
  })

  it('returns "-" for non-matching id', () => {
    expect(getLabelFromUtilItems(items, 99)).toBe('-')
  })

  it('returns "-" for null id', () => {
    expect(getLabelFromUtilItems(items, null)).toBe('-')
  })

  it('returns "-" for undefined items', () => {
    expect(getLabelFromUtilItems(undefined, 1)).toBe('-')
  })

  it('returns "-" for empty items array', () => {
    expect(getLabelFromUtilItems([], 1)).toBe('-')
  })
})

describe('formatChipCode', () => {
  it('returns "Non assegnato" when chip not set', () => {
    expect(formatChipCode(null, false)).toBe('Non assegnato')
    expect(formatChipCode(undefined, false)).toBe('Non assegnato')
  })

  it('returns "Da assegnare" when chip set but no code', () => {
    expect(formatChipCode(null, true)).toBe('Da assegnare')
    expect(formatChipCode(undefined, true)).toBe('Da assegnare')
  })

  it('returns the chip code when chip is set and code exists', () => {
    expect(formatChipCode('123.456.789.012.345', true)).toBe(
      '123.456.789.012.345'
    )
  })
})

describe('formatTypeFromMap', () => {
  const typeMap = { R: 'Ritrovato', S: 'Sequestrato', A: 'Adozione' }

  it('returns the mapped label', () => {
    expect(formatTypeFromMap(typeMap, 'R')).toBe('Ritrovato')
    expect(formatTypeFromMap(typeMap, 'A')).toBe('Adozione')
  })

  it('returns "-" for null type', () => {
    expect(formatTypeFromMap(typeMap, null)).toBe('-')
  })

  it('returns "-" for undefined map', () => {
    expect(formatTypeFromMap(undefined, 'R')).toBe('-')
  })

  it('returns the type key when not found in map', () => {
    expect(formatTypeFromMap(typeMap, 'UNKNOWN')).toBe('UNKNOWN')
  })
})

describe('getBreedName', () => {
  const breeds = [
    { id: 1, name: 'Labrador' },
    { id: 2, name: 'Pastore Tedesco' },
  ]

  it('returns breed name for matching id', () => {
    expect(getBreedName(breeds, 1)).toBe('Labrador')
    expect(getBreedName(breeds, 2)).toBe('Pastore Tedesco')
  })

  it('returns "-" for non-matching id', () => {
    expect(getBreedName(breeds, 99)).toBe('-')
  })

  it('returns "-" for null breed id', () => {
    expect(getBreedName(breeds, null)).toBe('-')
  })

  it('returns "-" for undefined breeds', () => {
    expect(getBreedName(undefined, 1)).toBe('-')
  })
})
