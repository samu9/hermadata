import { useQuery } from "react-query"
import { apiService } from "./main"
import { AnimalSearchQuery } from "./models/animal.schema"

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

export const useAnimalDocumentsQuery = (animal_id: number) =>
    useQuery(["animal-documents", animal_id], {
        queryFn: () => apiService.getAnimalDocuments(animal_id),
        staleTime: Infinity,
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
