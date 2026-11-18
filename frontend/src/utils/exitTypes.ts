export type ExitTypeOption = {
    id: string
    label: string
    // Races the exit type applies to; null/undefined means every race.
    race_ids?: string[] | null
}

/**
 * Keep only the exit types usable for an animal of the given race.
 * `keepId` is always kept (e.g. the value already saved on an entry), so an
 * existing selection never disappears from a dropdown.
 */
export const filterExitTypesByRace = <T extends ExitTypeOption>(
    exitTypes: T[] | undefined,
    raceId: string | null | undefined,
    keepId?: string | null,
): T[] =>
    (exitTypes ?? []).filter(
        (t) =>
            t.id === keepId ||
            !t.race_ids ||
            (!!raceId && t.race_ids.includes(raceId)),
    )
