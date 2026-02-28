import { describe, it, expect } from 'vitest'
import {
  createPaginatedResponseSchema,
  paginationQuerySchema,
} from '../../models/pagination.schema'
import { z } from 'zod'

describe('createPaginatedResponseSchema', () => {
  const itemSchema = z.object({ id: z.number(), name: z.string() })
  const paginatedSchema = createPaginatedResponseSchema(itemSchema)

  it('parses a paginated response with valid items', () => {
    const raw = {
      total: 3,
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ],
    }
    const result = paginatedSchema.parse(raw)
    expect(result.total).toBe(3)
    expect(result.items).toHaveLength(2)
    expect(result.items[0].name).toBe('Item 1')
  })

  it('parses a response with empty items', () => {
    const raw = { total: 0, items: [] }
    const result = paginatedSchema.parse(raw)
    expect(result.total).toBe(0)
    expect(result.items).toHaveLength(0)
  })

  it('fails when total is missing', () => {
    const raw = { items: [] }
    expect(() => paginatedSchema.parse(raw)).toThrow()
  })

  it('fails when items contain invalid data', () => {
    const raw = {
      total: 1,
      items: [{ id: 'not-a-number', name: 'Item' }],
    }
    expect(() => paginatedSchema.parse(raw)).toThrow()
  })
})

describe('paginationQuerySchema', () => {
  it('parses valid pagination query', () => {
    const raw = { from_index: 10, to_index: 20 }
    const result = paginationQuerySchema.parse(raw)
    expect(result.from_index).toBe(10)
    expect(result.to_index).toBe(20)
  })

  it('makes both fields optional', () => {
    const result = paginationQuerySchema.parse({})
    expect(result.from_index).toBeUndefined()
    expect(result.to_index).toBeUndefined()
  })
})
