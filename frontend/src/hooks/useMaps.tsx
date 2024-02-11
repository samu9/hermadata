import { useEntryTypesQuery, useExitTypesQuery } from "../queries"

export const useExitTypesMap = () => {
    const exitTypesQuery = useExitTypesQuery()
    return exitTypesQuery.data?.reduce(
        (result: { [key: string]: string }, current) => {
            result[current.id] = current.label
            return result
        },
        {}
    )
}

export const useEntryTypesMap = () => {
    const exitTypesQuery = useEntryTypesQuery()
    return exitTypesQuery.data?.reduce(
        (result: { [key: string]: string }, current) => {
            result[current.id] = current.label
            return result
        },
        {}
    )
}
