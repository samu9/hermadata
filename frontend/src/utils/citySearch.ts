import { matchSorter, rankings } from "match-sorter"
import { ProvinciaSchema } from "../models/city.schema"

export const MAX_CITY_SUGGESTIONS = 100

/**
 * Among equally ranked matches keep the order the API returned, which
 * already puts the preferred province and the favourite comuni first.
 */
const keepApiOrder = (a: { index: number }, b: { index: number }) =>
    a.index - b.index

/**
 * The name without spaces, apostrophes and dashes, so that a query typed
 * without them is still a prefix match ("sangiu" -> "San Giuliano ...",
 * ranked above "Monte San Giusto").
 */
const compactName = (item: { name: string }) =>
    item.name.replace(/[\s'’-]/g, "")

/**
 * Fuzzy search on province, by name or by sigla ("TS", "trst", "Trieste").
 * Ranking: exact > starts with > word starts with > contains > acronym >
 * letters in order. Case and accent insensitive.
 */
export const searchProvince = (
    province: ProvinciaSchema[],
    query: string,
    limit = MAX_CITY_SUGGESTIONS,
): ProvinciaSchema[] => {
    if (!query.trim()) return province.slice(0, limit)

    return matchSorter(province, query.trim(), {
        keys: [
            "name",
            compactName,
            { key: "id", threshold: rankings.EQUAL },
        ],
        baseSort: keepApiOrder,
    }).slice(0, limit)
}

/**
 * Fuzzy search on comuni by name, same ranking as `searchProvince`
 * (e.g. "sangiorgio" finds "San Giorgio di Nogaro", "ciampo" "Ciampino").
 * Favourite comuni whose name contains the query come first, so they stay
 * on top while typing; looser favourite matches (acronym, letters in order)
 * are ranked as usual.
 */
export const searchComuni = <T extends { name: string; favourite?: boolean }>(
    comuni: T[],
    query: string,
    limit = MAX_CITY_SUGGESTIONS,
): T[] => {
    // The API already lists the favourites first
    if (!query.trim()) return comuni.slice(0, limit)

    const keys = ["name", compactName]
    const favourites = matchSorter(
        comuni.filter((c) => c.favourite),
        query.trim(),
        { keys, threshold: rankings.CONTAINS, baseSort: keepApiOrder },
    )
    const pinned = new Set(favourites)
    const others = matchSorter(comuni, query.trim(), {
        keys,
        baseSort: keepApiOrder,
    }).filter((c) => !pinned.has(c))

    return [...favourites, ...others].slice(0, limit)
}

const normalize = (value: string) =>
    value
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .trim()

/**
 * The single item whose name is exactly `text` (case and accent
 * insensitive), used to accept typed text that was never picked from the
 * suggestions. Returns `undefined` when there is no match or it's ambiguous
 * (e.g. "Samone" exists both in TN and TO).
 */
export const findExactByName = <T extends { name: string }>(
    items: T[],
    text: string,
): T | undefined => {
    const target = normalize(text)
    const matches = items.filter((i) => normalize(i.name) === target)
    return matches.length === 1 ? matches[0] : undefined
}
