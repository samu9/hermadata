import { matchSorter, rankings } from "match-sorter"
import { ComuneSchema, ProvinciaSchema } from "../models/city.schema"

export const MAX_CITY_SUGGESTIONS = 100

/**
 * Among equally ranked matches keep the order the API returned, which
 * already puts the preferred province/comuni first.
 */
const keepApiOrder = (a: { index: number }, b: { index: number }) =>
    a.index - b.index

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
        keys: ["name", { key: "id", threshold: rankings.EQUAL }],
        baseSort: keepApiOrder,
    }).slice(0, limit)
}

/**
 * Fuzzy search on comuni by name, same ranking as `searchProvince`
 * (e.g. "sangiorgio" finds "San Giorgio di Nogaro", "ciampo" "Ciampino").
 */
export const searchComuni = (
    comuni: ComuneSchema[],
    query: string,
    limit = MAX_CITY_SUGGESTIONS,
): ComuneSchema[] => {
    if (!query.trim()) return comuni.slice(0, limit)

    return matchSorter(comuni, query.trim(), {
        keys: ["name"],
        baseSort: keepApiOrder,
    }).slice(0, limit)
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
