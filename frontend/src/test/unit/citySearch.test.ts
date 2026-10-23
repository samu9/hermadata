import { describe, it, expect } from 'vitest'
import {
  findExactByName,
  searchComuni,
  searchProvince,
} from '../../utils/citySearch'

const province = [
  { id: 'TS', name: 'Trieste' },
  { id: 'GO', name: 'Gorizia' },
  { id: 'TO', name: 'Torino' },
  { id: 'TN', name: 'Trento' },
]

const comuni = [
  { id: 'L424', name: 'Trieste', provincia: 'TS' },
  { id: 'H929', name: 'San Giorgio di Nogaro', provincia: 'UD' },
  { id: 'C719', name: 'Ciampino', provincia: 'RM' },
  { id: 'A074', name: 'Agliè', provincia: 'TO' },
  { id: 'H224', name: "Reggio nell'Emilia", provincia: 'RE' },
  { id: 'H743', name: 'Samone', provincia: 'TN' },
  { id: 'H753', name: 'Samone', provincia: 'TO' },
  { id: 'L483', name: 'Udine', provincia: 'UD' },
]

const names = (items: { name: string }[]) => items.map((i) => i.name)

describe('searchProvince', () => {
  it('returns everything, in API order, for an empty query', () => {
    expect(searchProvince(province, '  ')).toEqual(province)
  })

  it('matches by sigla', () => {
    expect(searchProvince(province, 'to')[0].id).toBe('TO')
  })

  it('matches letters in order', () => {
    expect(names(searchProvince(province, 'trst'))).toEqual(['Trieste'])
  })

  it('ranks prefix matches before fuzzy ones', () => {
    expect(names(searchProvince(province, 'tr'))).toEqual([
      'Trieste',
      'Trento',
      'Torino',
    ])
  })
})

describe('searchComuni', () => {
  it('matches across words and apostrophes', () => {
    expect(names(searchComuni(comuni, 'sangiorgio'))).toEqual([
      'San Giorgio di Nogaro',
    ])
    expect(names(searchComuni(comuni, 'reggio emilia'))).toEqual([
      "Reggio nell'Emilia",
    ])
  })

  it('ranks names starting with a query typed without spaces first', () => {
    const sanGiu = [
      { id: 'F612', name: 'Monte San Giusto', provincia: 'MC' },
      { id: 'G134', name: 'Orta San Giulio', provincia: 'NO' },
      { id: 'H930', name: 'San Giuliano Milanese', provincia: 'MI' },
    ]
    expect(names(searchComuni(sanGiu, 'sangiu'))[0]).toBe(
      'San Giuliano Milanese',
    )
    expect(names(searchComuni(comuni, 'reggionell'))).toEqual([
      "Reggio nell'Emilia",
    ])
  })

  it('ignores accents and case', () => {
    expect(names(searchComuni(comuni, 'AGLIE'))).toEqual(['Agliè'])
  })

  it('tolerates missing letters', () => {
    expect(names(searchComuni(comuni, 'ciampno'))).toEqual(['Ciampino'])
  })

  it('limits the number of suggestions', () => {
    expect(searchComuni(comuni, '', 3)).toHaveLength(3)
  })
})

describe('findExactByName', () => {
  it('finds a unique exact match ignoring accents and case', () => {
    expect(findExactByName(comuni, ' aglie ')?.id).toBe('A074')
  })

  it('returns undefined for partial or ambiguous names', () => {
    expect(findExactByName(comuni, 'Trie')).toBeUndefined()
    expect(findExactByName(comuni, 'Samone')).toBeUndefined()
  })
})
