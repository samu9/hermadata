import { describe, it, expect } from "vitest"
import { animalExitSchema } from "../models/animal.schema"

describe("animalExitSchema - Temporary Adoption", () => {
    it("validates regular adoption requires adopter details", () => {
        // Missing adopter_id should fail for adoption exit type
        const result = animalExitSchema.safeParse({
            animal_id: 1,
            exit_type: "A",
            exit_date: new Date("2024-01-15"),
        })
        expect(result.success).toBe(false)
    })

    it("validates temporary adoption requires adopter details", () => {
        // Missing adopter_id should fail for temporary adoption too
        const result = animalExitSchema.safeParse({
            animal_id: 1,
            exit_type: "T",
            exit_date: new Date("2024-01-15"),
        })
        expect(result.success).toBe(false)
    })

    it("validates temporary adoption with full data", () => {
        const result = animalExitSchema.safeParse({
            animal_id: 1,
            exit_type: "T",
            exit_date: new Date("2024-01-15"),
            adopter_id: 5,
            location_address: "Via Test 1",
            location_city_code: "H501",
        })
        expect(result.success).toBe(true)
    })

    it("validates regular adoption with full data", () => {
        const result = animalExitSchema.safeParse({
            animal_id: 1,
            exit_type: "A",
            exit_date: new Date("2024-01-15"),
            adopter_id: 5,
            location_address: "Via Test 1",
            location_city_code: "H501",
        })
        expect(result.success).toBe(true)
    })

    it("validates death exit type without adopter", () => {
        const result = animalExitSchema.safeParse({
            animal_id: 1,
            exit_type: "D",
            exit_date: new Date("2024-01-15"),
        })
        expect(result.success).toBe(true)
    })

    it("validates disappeared exit type without adopter", () => {
        const result = animalExitSchema.safeParse({
            animal_id: 1,
            exit_type: "I",
            exit_date: new Date("2024-01-15"),
        })
        expect(result.success).toBe(true)
    })
})
