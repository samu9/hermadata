import { useQuery } from "react-query"
import { apiService } from "./main"

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
