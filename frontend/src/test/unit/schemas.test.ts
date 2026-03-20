import { describe, it, expect } from 'vitest'
import { loginSchema, loginResponseSchema, userSchema } from '../../models/user.schema'
import { adopterSchema, newAdopterSchema } from '../../models/adopter.schema'
import { raceSchema } from '../../models/race.schema'
import { comuneSchema, provinciaSchema } from '../../models/city.schema'
import { intUtilItemSchema } from '../../models/util.schema'

describe('loginSchema', () => {
  it('validates login credentials', () => {
    const result = loginSchema.parse({
      username: 'user@example.com',
      password: 'mypassword',
    })
    expect(result.username).toBe('user@example.com')
    expect(result.password).toBe('mypassword')
  })

  it('accepts empty username (no email validation)', () => {
    // loginSchema only has username: z.string() without email format
    const result = loginSchema.parse({ username: '', password: '' })
    expect(result.username).toBe('')
  })
})

describe('loginResponseSchema', () => {
  it('parses a full login response', () => {
    const raw = {
      access_token: 'abc123',
      token_type: 'bearer',
      username: 'admin@test.com',
      is_superuser: true,
      role: 'admin',
      permissions: ['CA', 'MA'],
    }
    const result = loginResponseSchema.parse(raw)
    expect(result.access_token).toBe('abc123')
    expect(result.is_superuser).toBe(true)
    expect(result.permissions).toEqual(['CA', 'MA'])
  })

  it('accepts minimal response without optional fields', () => {
    const raw = { access_token: 'abc', token_type: 'bearer' }
    const result = loginResponseSchema.parse(raw)
    expect(result.access_token).toBe('abc')
    expect(result.username).toBeUndefined()
  })
})

describe('userSchema', () => {
  it('parses a full user object', () => {
    const raw = {
      username: 'testuser',
      is_superuser: false,
      email: 'test@test.com',
      role: 'operator',
      permissions: ['CA', 'MA'],
    }
    const result = userSchema.parse(raw)
    expect(result.username).toBe('testuser')
    expect(result.is_superuser).toBe(false)
    expect(result.permissions).toEqual(['CA', 'MA'])
  })

  it('defaults permissions to empty array', () => {
    const raw = { username: 'testuser', is_superuser: false }
    const result = userSchema.parse(raw)
    expect(result.permissions).toEqual([])
  })
})

describe('adopterSchema', () => {
  it('parses a valid adopter', () => {
    const raw = {
      id: 1,
      name: 'Mario',
      surname: 'Rossi',
      fiscal_code: 'RSSMRA80A01H501Z',
      residence_city_code: 'H501',
      phone: '3331234567',
      document_type: 'CI',
      document_number: 'AB123456',
    }
    const result = adopterSchema.parse(raw)
    expect(result.id).toBe(1)
    expect(result.name).toBe('Mario')
    expect(result.fiscal_code).toBe('RSSMRA80A01H501Z')
  })
})

describe('newAdopterSchema', () => {
  it('validates a new adopter', () => {
    const raw = {
      name: 'Luigi',
      surname: 'Bianchi',
      fiscal_code: 'BNCLGU90A01F205X',
      residence_city_code: 'F205',
      phone: '3339876543',
      document_type: 'PA',
      document_number: 'CC987654',
    }
    const result = newAdopterSchema.parse(raw)
    expect(result.name).toBe('Luigi')
  })

  it('rejects fiscal code shorter than 16 chars', () => {
    const raw = {
      name: 'Luigi',
      surname: 'Bianchi',
      fiscal_code: 'BNCLGU90A01',
      residence_city_code: 'F205',
      phone: '3339876543',
      document_type: 'PA',
      document_number: 'CC987654',
    }
    expect(() => newAdopterSchema.parse(raw)).toThrow()
  })

  it('rejects phone shorter than 9 chars', () => {
    const raw = {
      name: 'Luigi',
      surname: 'Bianchi',
      fiscal_code: 'BNCLGU90A01F205X',
      residence_city_code: 'F205',
      phone: '123',
      document_type: 'PA',
      document_number: 'CC987654',
    }
    expect(() => newAdopterSchema.parse(raw)).toThrow()
  })
})

describe('raceSchema', () => {
  it('parses a race object', () => {
    const result = raceSchema.parse({ id: 'C', name: 'Cane' })
    expect(result.id).toBe('C')
    expect(result.name).toBe('Cane')
  })

  it('rejects id longer than 1 character', () => {
    expect(() => raceSchema.parse({ id: 'CC', name: 'Cane' })).toThrow()
  })
})

describe('comuneSchema', () => {
  it('parses a valid comune', () => {
    const result = comuneSchema.parse({ id: 'H501', name: 'Roma' })
    expect(result.id).toBe('H501')
    expect(result.name).toBe('Roma')
  })

  it('rejects invalid id format', () => {
    expect(() => comuneSchema.parse({ id: '1234', name: 'Roma' })).toThrow()
  })
})

describe('provinciaSchema', () => {
  it('parses a valid provincia', () => {
    const result = provinciaSchema.parse({ id: 'RM', name: 'Roma' })
    expect(result.id).toBe('RM')
    expect(result.name).toBe('Roma')
  })

  it('rejects id longer than 2 characters', () => {
    expect(() => provinciaSchema.parse({ id: 'ROM', name: 'Roma' })).toThrow()
  })
})

describe('intUtilItemSchema', () => {
  it('parses a valid item', () => {
    const result = intUtilItemSchema.parse({ id: 1, label: 'Piccolo' })
    expect(result.id).toBe(1)
    expect(result.label).toBe('Piccolo')
  })

  it('rejects string id', () => {
    expect(() =>
      intUtilItemSchema.parse({ id: 'one', label: 'Test' })
    ).toThrow()
  })
})
