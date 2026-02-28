import { describe, it, expect } from 'vitest'
import {
  animalSchema,
  animalSearchResultSchema,
  paginatedAnimalSearchResultSchema,
  newAnimalEntrySchema,
  animalEditSchema,
  exitCheckResultSchema,
  animalLogSchema,
} from '../../models/animal.schema'

describe('animalSchema', () => {
  it('parses a valid animal object', () => {
    const raw = {
      code: 'C0012345678AB',
      name: 'Fido',
      race_id: 'C',
      breed_id: null,
      sterilized: false,
      entry_date: '2024-01-15',
      entry_type: 'R',
      exit_date: null,
      exit_type: null,
      birth_date: null,
      stage: null,
      adoptability_index: 0,
      chip_code: null,
      chip_code_set: true,
      img_path: null,
      sex: 1,
      notes: null,
      fur: null,
      size: null,
      color: null,
      in_shelter_from: null,
      healthcare_stage: false,
    }
    const result = animalSchema.parse(raw)
    expect(result.code).toBe('C0012345678AB')
    expect(result.name).toBe('Fido')
    expect(result.race_id).toBe('C')
  })

  it('accepts null name', () => {
    const raw = {
      code: 'C0012345678AB',
      name: null,
      race_id: 'C',
      entry_date: '2024-01-15',
      entry_type: 'R',
      chip_code_set: false,
      img_path: null,
      sex: null,
    }
    const result = animalSchema.parse(raw)
    expect(result.name).toBeNull()
  })
})

describe('animalSearchResultSchema', () => {
  it('parses valid search result', () => {
    const raw = {
      id: 1,
      code: 'C001',
      name: 'Fido',
      race_id: 'C',
      chip_code: '123456789012345',
      rescue_city_code: 'H501',
      rescue_city: 'Roma',
      rescue_province: 'RM',
      entry_date: '2024-01-15',
      entry_type: 'R',
      exit_date: null,
      exit_type: null,
      in_shelter_from: null,
      healthcare_stage: false,
      without_chip: false,
    }
    const result = animalSearchResultSchema.parse(raw)
    expect(result.id).toBe(1)
    expect(result.name).toBe('Fido')
    expect(result.entry_date).toBeInstanceOf(Date)
  })

  it('parses null entry_date to null', () => {
    const raw = {
      id: 1,
      code: 'C001',
      name: null,
      race_id: 'C',
      chip_code: null,
      rescue_city_code: 'H501',
      rescue_city: 'Roma',
      rescue_province: 'RM',
      entry_date: null,
      entry_type: 'R',
    }
    const result = animalSearchResultSchema.parse(raw)
    expect(result.entry_date).toBeNull()
  })
})

describe('paginatedAnimalSearchResultSchema', () => {
  it('parses paginated results', () => {
    const raw = {
      total: 5,
      items: [
        {
          id: 1,
          code: 'C001',
          name: 'Fido',
          race_id: 'C',
          rescue_city_code: 'H501',
          rescue_city: 'Roma',
          rescue_province: 'RM',
          entry_date: '2024-01-15',
          entry_type: 'R',
        },
      ],
    }
    const result = paginatedAnimalSearchResultSchema.parse(raw)
    expect(result.total).toBe(5)
    expect(result.items).toHaveLength(1)
  })
})

describe('newAnimalEntrySchema', () => {
  it('validates a new animal entry', () => {
    const raw = {
      rescue_city_code: 'H501',
      entry_type: 'R',
      race_id: 'C',
    }
    const result = newAnimalEntrySchema.parse(raw)
    expect(result.entry_type).toBe('R')
    expect(result.rescue_city_code).toBe('H501')
  })

  it('fails on invalid rescue_city_code length', () => {
    const raw = {
      rescue_city_code: 'H5',
      entry_type: 'R',
    }
    expect(() => newAnimalEntrySchema.parse(raw)).toThrow()
  })
})

describe('animalEditSchema', () => {
  it('allows all nullable fields', () => {
    const raw = {
      name: null,
      chip_code: null,
      chip_code_set: false,
      birth_date: null,
      fur: null,
      color: null,
      size: null,
      sterilized: null,
      sex: null,
      breed_id: null,
      notes: null,
    }
    const result = animalEditSchema.parse(raw)
    expect(result.chip_code_set).toBe(false)
  })

  it('converts empty chip_code string to null', () => {
    const raw = {
      chip_code: '',
      chip_code_set: false,
      sex: null,
    }
    const result = animalEditSchema.parse(raw)
    expect(result.chip_code).toBeNull()
  })
})

describe('exitCheckResultSchema', () => {
  it('parses an exit check result', () => {
    const raw = { can_exit: true, missing_fields: [] }
    const result = exitCheckResultSchema.parse(raw)
    expect(result.can_exit).toBe(true)
    expect(result.missing_fields).toHaveLength(0)
  })

  it('parses exit check with missing fields', () => {
    const raw = {
      can_exit: false,
      missing_fields: ['chip_code', 'birth_date'],
    }
    const result = exitCheckResultSchema.parse(raw)
    expect(result.can_exit).toBe(false)
    expect(result.missing_fields).toEqual(['chip_code', 'birth_date'])
  })
})

describe('animalLogSchema', () => {
  it('parses an animal log entry', () => {
    const raw = {
      id: 1,
      animal_id: 42,
      event: 'entry',
      event_description: 'Ingresso animale',
      data: null,
      user_id: 1,
      created_at: '2024-01-15T10:00:00',
    }
    const result = animalLogSchema.parse(raw)
    expect(result.id).toBe(1)
    expect(result.event).toBe('entry')
  })
})
