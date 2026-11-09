import { describe, expect, it } from "vitest"
import { filterExitTypesByRace } from "../../utils/exitTypes"

const exitTypes = [
    { id: "A", label: "Adozione", race_ids: null },
    { id: "D", label: "Morte" },
    { id: "L", label: "Reimmesso sul territorio", race_ids: ["G"] },
]

const ids = (items: { id: string }[]) => items.map((t) => t.id)

describe("filterExitTypesByRace", () => {
    it("keeps race-specific types for the matching race", () => {
        expect(ids(filterExitTypesByRace(exitTypes, "G"))).toEqual([
            "A",
            "D",
            "L",
        ])
    })

    it("drops race-specific types for other races", () => {
        expect(ids(filterExitTypesByRace(exitTypes, "C"))).toEqual(["A", "D"])
    })

    it("drops race-specific types when the race is unknown", () => {
        expect(ids(filterExitTypesByRace(exitTypes, undefined))).toEqual([
            "A",
            "D",
        ])
    })

    it("always keeps the currently selected type", () => {
        expect(ids(filterExitTypesByRace(exitTypes, "C", "L"))).toEqual([
            "A",
            "D",
            "L",
        ])
    })

    it("handles missing data", () => {
        expect(filterExitTypesByRace(undefined, "G")).toEqual([])
    })
})
