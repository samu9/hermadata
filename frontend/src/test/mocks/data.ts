import { AnimalSearchResult } from '../../models/animal.schema'
import { Adopter } from '../../models/adopter.schema'
import { ManagementUser } from '../../models/user.schema'
import { Race } from '../../models/race.schema'
import { ProvinciaSchema, ComuneSchema } from '../../models/city.schema'
import { IntUtilItem } from '../../models/util.schema'

export const mockRaces: Race[] = [
  { id: 'C', name: 'Cane' },
  { id: 'G', name: 'Gatto' },
]

export const mockEntryTypes = [
  { id: 'R', label: 'Ritrovato', healthcare_stage: true },
  { id: 'S', label: 'Sequestrato', healthcare_stage: true },
  { id: 'V', label: 'Volontario', healthcare_stage: false },
]

export const mockExitTypes = [
  { id: 'A', label: 'Adozione' },
  { id: 'D', label: 'Deceduto' },
  { id: 'T', label: 'Trasferimento' },
]

export const mockAnimalSearchResults: AnimalSearchResult[] = [
  {
    id: 1,
    code: 'C001',
    name: 'Fido',
    race_id: 'C',
    chip_code: '123456789012345',
    rescue_city_code: 'A001',
    rescue_city: 'Roma',
    rescue_province: 'RM',
    entry_date: new Date('2024-01-15'),
    entry_type: 'R',
    exit_date: null,
    exit_type: null,
    in_shelter_from: new Date('2024-01-15'),
    healthcare_stage: false,
    without_chip: false,
  },
  {
    id: 2,
    code: 'G001',
    name: 'Micio',
    race_id: 'G',
    chip_code: null,
    rescue_city_code: 'A002',
    rescue_city: 'Milano',
    rescue_province: 'MI',
    entry_date: new Date('2024-02-01'),
    entry_type: 'S',
    exit_date: new Date('2024-03-01'),
    exit_type: 'A',
    in_shelter_from: null,
    healthcare_stage: true,
    without_chip: true,
  },
]

export const mockPaginatedAnimals = {
  total: 2,
  items: mockAnimalSearchResults,
}

export const mockAdopters: Adopter[] = [
  {
    id: 1,
    name: 'Mario',
    surname: 'Rossi',
    fiscal_code: 'RSSMRA80A01H501Z',
    residence_city_code: 'H501',
    phone: '3331234567',
    document_type: 'CI',
    document_number: 'AB123456',
  },
]

export const mockPaginatedAdopters = {
  total: 1,
  items: mockAdopters,
}

export const mockManagementUsers: ManagementUser[] = [
  {
    id: 1,
    name: 'Admin',
    surname: 'User',
    email: 'admin@hermadata.it',
    is_active: true,
    is_superuser: true,
    role_name: 'admin',
    city_codes: [],
    created_at: '2024-01-01T00:00:00',
    updated_at: '2024-01-01T00:00:00',
  },
  {
    id: 2,
    name: 'Regular',
    surname: 'User',
    email: 'user@hermadata.it',
    is_active: true,
    is_superuser: false,
    role_name: 'operator',
    city_codes: ['H501'],
    created_at: '2024-01-01T00:00:00',
    updated_at: '2024-01-01T00:00:00',
  },
]

export const mockPaginatedUsers = {
  total: 2,
  items: mockManagementUsers,
}

export const mockProvince: ProvinciaSchema[] = [
  { id: 'RM', name: 'Roma' },
  { id: 'MI', name: 'Milano' },
]

export const mockComuni: ComuneSchema[] = [
  { id: 'H501', name: 'Roma' },
  { id: 'F205', name: 'Milano' },
]

export const mockAnimalSizes: IntUtilItem[] = [
  { id: 1, label: 'Piccolo' },
  { id: 2, label: 'Medio' },
  { id: 3, label: 'Grande' },
]

export const mockAnimalFurTypes: IntUtilItem[] = [
  { id: 1, label: 'Corto' },
  { id: 2, label: 'Lungo' },
]

export const mockAnimalFurColors: IntUtilItem[] = [
  { id: 1, label: 'Nero' },
  { id: 2, label: 'Bianco' },
  { id: 3, label: 'Marrone' },
]

export const mockLoginResponse = {
  access_token: 'mock-access-token-12345',
  token_type: 'bearer',
  username: 'admin@hermadata.it',
  is_superuser: true,
  role: 'admin',
  permissions: ['CA', 'MA', 'UD', 'EAD', 'EAN', 'BPA', 'BNA', 'BAD', 'BAV', 'DD', 'DS', 'SDP', 'MU'],
}

export const mockDashboardStats = {
  totalAnimals: 150,
  activeAnimals: 100,
  adoptedAnimals: 50,
  recentEntries: 10,
  recentExits: 5,
}
