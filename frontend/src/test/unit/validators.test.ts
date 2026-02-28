import { describe, it, expect } from 'vitest'
import {
  animalCodeValidator,
  animalRaceValidator,
  cityCodeValidator,
  provinceValidator,
  breedNameValidator,
  dateFromString,
  chipCodeValidator,
} from '../../models/validators'

describe('animalCodeValidator', () => {
  it('accepts a 13-character code', () => {
    expect(() => animalCodeValidator.parse('C001234567890')).not.toThrow()
  })

  it('rejects codes shorter than 13 characters', () => {
    expect(() => animalCodeValidator.parse('C001')).toThrow()
  })

  it('rejects codes longer than 13 characters', () => {
    expect(() => animalCodeValidator.parse('C00123456789012')).toThrow()
  })
})

describe('animalRaceValidator', () => {
  it('accepts single character', () => {
    expect(animalRaceValidator.parse('C')).toBe('C')
    expect(animalRaceValidator.parse('G')).toBe('G')
  })

  it('rejects multi-character strings', () => {
    expect(() => animalRaceValidator.parse('CC')).toThrow()
  })
})

describe('cityCodeValidator', () => {
  it('accepts valid city codes like H501', () => {
    expect(cityCodeValidator.parse('H501')).toBe('H501')
    expect(cityCodeValidator.parse('A001')).toBe('A001')
  })

  it('rejects invalid patterns', () => {
    expect(() => cityCodeValidator.parse('1234')).toThrow()
    expect(() => cityCodeValidator.parse('ABC')).toThrow()
  })
})

describe('provinceValidator', () => {
  it('accepts two-character province codes', () => {
    expect(provinceValidator.parse('RM')).toBe('RM')
    expect(provinceValidator.parse('MI')).toBe('MI')
  })

  it('rejects codes of wrong length', () => {
    expect(() => provinceValidator.parse('ROM')).toThrow()
    expect(() => provinceValidator.parse('R')).toThrow()
  })
})

describe('breedNameValidator', () => {
  it('accepts valid breed names', () => {
    expect(breedNameValidator.parse('Labrador')).toBe('Labrador')
    expect(breedNameValidator.parse('Golden Retriever')).toBe(
      'Golden Retriever'
    )
  })

  it('rejects names with fewer than 2 letters', () => {
    expect(() => breedNameValidator.parse('a')).toThrow()
    expect(() => breedNameValidator.parse('1')).toThrow()
  })
})

describe('dateFromString', () => {
  it('converts a valid date string to a Date', () => {
    const result = dateFromString.parse('2024-01-15')
    expect(result).toBeInstanceOf(Date)
  })

  it('converts an invalid date string to null', () => {
    const result = dateFromString.parse('not-a-date')
    expect(result).toBeNull()
  })

  it('passes through a Date object', () => {
    const date = new Date('2024-01-15')
    const result = dateFromString.parse(date)
    expect(result).toBeInstanceOf(Date)
  })

  it('returns null for null input', () => {
    const result = dateFromString.parse(null)
    expect(result).toBeNull()
  })
})

describe('chipCodeValidator', () => {
  it('accepts valid chip code format', () => {
    expect(chipCodeValidator.parse('123.456.789.012.345')).toBe(
      '123.456.789.012.345'
    )
  })

  it('rejects invalid chip code formats', () => {
    expect(() => chipCodeValidator.parse('123456789012345')).toThrow()
    expect(() => chipCodeValidator.parse('123.456')).toThrow()
  })
})
