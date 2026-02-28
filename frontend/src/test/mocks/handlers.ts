import { http, HttpResponse } from 'msw'
import {
  mockRaces,
  mockEntryTypes,
  mockExitTypes,
  mockPaginatedAnimals,
  mockPaginatedAdopters,
  mockAnimalSizes,
  mockAnimalFurTypes,
  mockAnimalFurColors,
  mockLoginResponse,
  mockProvince,
  mockComuni,
  mockPaginatedUsers,
  mockAnimalSearchResults,
} from './data'

const BASE_URL = 'http://localhost:8000'

export const handlers = [
  // Auth
  http.post(`${BASE_URL}/user/login`, () => {
    return HttpResponse.json(mockLoginResponse)
  }),

  http.get(`${BASE_URL}/user/me`, () => {
    return HttpResponse.json({
      id: 1,
      name: 'Admin',
      surname: 'User',
      email: 'admin@hermadata.it',
      is_active: true,
      is_superuser: true,
      role_name: 'admin',
      city_codes: [],
      created_at: '2024-01-01T00:00:00',
    })
  }),

  // Users
  http.get(`${BASE_URL}/user/`, () => {
    return HttpResponse.json(mockPaginatedUsers)
  }),

  http.get(`${BASE_URL}/user/roles`, () => {
    return HttpResponse.json([
      { id: 1, name: 'admin', permissions: [] },
      { id: 2, name: 'operator', permissions: [] },
    ])
  }),

  http.get(`${BASE_URL}/user/permissions`, () => {
    return HttpResponse.json([
      { code: 'CA', label: 'Crea Animale' },
      { code: 'MA', label: 'Effettua Adozione' },
    ])
  }),

  // Races
  http.get(`${BASE_URL}/race`, () => {
    return HttpResponse.json(mockRaces)
  }),

  // Animals
  http.get(`${BASE_URL}/animal/search`, () => {
    return HttpResponse.json(mockPaginatedAnimals)
  }),

  http.get(`${BASE_URL}/animal/:id`, ({ params }) => {
    const animal = mockAnimalSearchResults.find(
      (a) => a.id.toString() === params.id
    )
    if (!animal) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json({
      code: 'C0012345678AB',
      name: animal.name,
      race_id: animal.race_id,
      breed_id: null,
      sterilized: null,
      entry_date: animal.entry_date,
      entry_type: animal.entry_type,
      exit_date: animal.exit_date,
      exit_type: animal.exit_type,
      birth_date: null,
      stage: null,
      adoptability_index: 0,
      chip_code: animal.chip_code,
      chip_code_set: false,
      img_path: null,
      sex: null,
      notes: null,
      fur: null,
      size: null,
      color: null,
      in_shelter_from: null,
      healthcare_stage: false,
      without_chip: animal.without_chip,
    })
  }),

  http.post(`${BASE_URL}/animal`, () => {
    return HttpResponse.json('C999')
  }),

  http.get(`${BASE_URL}/animal/:id/entries`, () => {
    return HttpResponse.json([])
  }),

  http.get(`${BASE_URL}/animal/:id/logs`, () => {
    return HttpResponse.json([])
  }),

  http.get(`${BASE_URL}/animal/:id/document`, () => {
    return HttpResponse.json([])
  }),

  // Adopters
  http.get(`${BASE_URL}/adopter/search`, () => {
    return HttpResponse.json(mockPaginatedAdopters)
  }),

  // Entry/Exit types
  http.get(`${BASE_URL}/util/entry-types`, () => {
    return HttpResponse.json(mockEntryTypes)
  }),

  http.get(`${BASE_URL}/util/exit-types`, () => {
    return HttpResponse.json(mockExitTypes)
  }),

  // Province/Comuni
  http.get(`${BASE_URL}/util/province`, () => {
    return HttpResponse.json(mockProvince)
  }),

  http.get(`${BASE_URL}/util/comuni`, () => {
    return HttpResponse.json(mockComuni)
  }),

  // Util
  http.get(`${BASE_URL}/util/animal-size`, () => {
    return HttpResponse.json(mockAnimalSizes)
  }),

  http.get(`${BASE_URL}/util/animal-fur`, () => {
    return HttpResponse.json(mockAnimalFurTypes)
  }),

  http.get(`${BASE_URL}/util/fur-color`, () => {
    return HttpResponse.json(mockAnimalFurColors)
  }),

  http.get(`${BASE_URL}/util/events`, () => {
    return HttpResponse.json([])
  }),

  // Breeds
  http.get(`${BASE_URL}/breed`, () => {
    return HttpResponse.json([])
  }),

  // Documents
  http.get(`${BASE_URL}/document/kind`, () => {
    return HttpResponse.json([])
  }),

  // Vets
  http.get(`${BASE_URL}/vet/search`, () => {
    return HttpResponse.json({ total: 0, items: [] })
  }),

  // User activity
  http.get(`${BASE_URL}/user/activity`, () => {
    return HttpResponse.json({ total: 0, items: [] })
  }),
]
