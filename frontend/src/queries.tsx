import { useQuery } from "react-query"
import { apiService } from "./main"
import { AdopterSearch } from "./models/adopter.schema"
import { AnimalSearchQuery } from "./models/animal.schema"
import { VetSearch } from "./models/vet.schema"

export const useAnimalSearchQuery = (queryData: AnimalSearchQuery) =>
    useQuery(["animal-search", queryData], {
        queryFn: () => apiService.searchAnimals(queryData),
        staleTime: Infinity,
    })

export const useAnimalQuery = (id: string) =>
    useQuery(["animal", id], {
        queryFn: () => apiService.getAnimal(id),
        staleTime: Infinity,
    })

export const useAnimalEntriesQuery = (animalId: string) =>
    useQuery(["animal-entries", animalId], {
        queryFn: () => apiService.getAnimalEntries(animalId),
        staleTime: 0, // Always fetch fresh data for entries
    })

export const useRacesQuery = () =>
    useQuery("races", () => apiService.getRaces(), {
        placeholderData: [],
        staleTime: Infinity,
    })

export const useBreedsQuery = (raceId?: string) =>
    useQuery(
        ["breeds", raceId],
        () => (raceId && apiService.getBreeds(raceId)) || [],
        {
            placeholderData: [],
            staleTime: Infinity,
        }
    )

export const useProvinceQuery = () =>
    useQuery("province", () => apiService.getProvince(), {
        placeholderData: [],
        staleTime: Infinity,
    })

export const useComuniQuery = (provincia?: string) =>
    useQuery(
        ["comuni", provincia],
        () => (provincia && apiService.getComuni(provincia)) || [],
        {
            placeholderData: [],
            staleTime: Infinity,
        }
    )

export const useDocKindsQuery = () =>
    useQuery("doc-kinds", () => apiService.getAllDocKinds(), {
        staleTime: Infinity,
    })

export const useAnimalSizesQuery = () =>
    useQuery("animal-sizes", () => apiService.getAnimalSizes(), {
        staleTime: Infinity,
    })

export const useAnimalFurTypesQuery = () =>
    useQuery("animal-fur-types", () => apiService.getAnimalFurTypes(), {
        staleTime: Infinity,
    })

export const useAnimalFurColorsQuery = () =>
    useQuery("fur-color", () => apiService.getAnimalFurColors(), {
        staleTime: Infinity,
    })

export const useAnimalDocumentsQuery = (animal_id: number) =>
    useQuery(["animal-documents", animal_id], {
        queryFn: () => apiService.getAnimalDocuments(animal_id),
        placeholderData: [],
    })
// export const useNewEntryMutation = useMutation({
//     mutationFn: (args: { id: string; data: AnimalEdit }) =>
//         apiService.updateAnimal(args.id, args.data),
//     onSuccess: (
//         result: boolean,
//         variables: { id: string; data: AnimalEdit },
//         context
//     ) => {
//         queryClient.setQueryData(["animal", variables.id], variables.data)
//         toast.current?.show({
//             severity: "success",
//             summary: "Scheda aggiornata",
//         })
//     },
//     onError: () =>
//         toast.current?.show({
//             severity: "error",
//             summary: "Qualcosa è andato storto",
//         }),
//     mutationKey: "updateAnimal",
// })

export const useEntryTypesQuery = () =>
    useQuery(["entry-types"], () => apiService.getEntryTypes(), {
        placeholderData: [],
        staleTime: Infinity,
    })

export const useExitTypesQuery = () =>
    useQuery({
        queryKey: ["exit-types"],
        queryFn: () => apiService.getExitTypes(),
        placeholderData: [],
        staleTime: Infinity,
    })

export const useAdopterSearchQuery = (queryData: AdopterSearch) =>
    useQuery(["adopter-search", queryData], {
        queryFn: () => apiService.searchAdopter(queryData),
        staleTime: Infinity,
    })

export const useVetSearchQuery = (queryData: VetSearch) =>
    useQuery(["vet-search", queryData], {
        queryFn: () => apiService.searchVet(queryData),
        staleTime: Infinity,
    })

export const useRolesQuery = () =>
    useQuery("roles", () => apiService.getRoles(), {
        placeholderData: [],
        staleTime: Infinity,
    })

// Dashboard queries
export const useDashboardStatsQuery = () =>
    useQuery(["dashboard-stats"], () => apiService.getDashboardStats(), {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    })

export const useRecentAnimalsQuery = (limit: number = 5) =>
    useQuery(
        ["recent-animals", limit],
        () => apiService.getRecentAnimals(limit),
        {
            staleTime: 2 * 60 * 1000, // 2 minutes
            refetchOnWindowFocus: false,
        }
    )
