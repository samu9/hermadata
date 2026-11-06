export enum ApiErrorCode {
    existingChipCode = "ECC",
}

export enum Permission {
    CREATE_ANIMAL = "CA",
    MAKE_ADOPTION = "MA",
    UPLOAD_DOCUMENT = "UD",
    EDIT_ADOPTER = "EAD",
    EDIT_ANIMAL = "EAN",
    BROWSE_PRESENT_ANIMALS = "BPA",
    BROWSE_NOT_PRESENT_ANIMALS = "BNA",
    BROWSE_ADOPTERS = "BAD",
    BROWSE_VETS = "BAV",
    DOWNLOAD_DOCUMENT = "DD",
    DOWNLOAD_SUMMARY = "DS",
    SET_DOCUMENT_PERMISSION = "SDP",
    MANAGE_USERS = "MU",
    BROWSE_DELETED_ANIMALS = "BDA",
    ADD_ANIMAL_EVENT = "AAE",
    BROWSE_ANIMAL_EVENTS = "BAE",
    UPLOAD_ANIMAL_IMAGE = "UAI",
}

export type SeverityType =
    | "success"
    | "secondary"
    | "info"
    | "warning"
    | "danger"
    | "help"
    | undefined

// Document kinds strictly tied to a specific animal entry/exit event.
// Mirrors ENTRY_TIED_DOC_KIND_CODES in the backend constants.
export const ENTRY_TIED_DOC_KIND_CODES = [
    "CI",
    "U",
    "UF",
    "AD",
    "ADF",
    "AF",
    "AFF",
    "VA",
    "VAF",
    "RP",
]

export const REQUIRED_EXIT_FIELDS_LABELS: Record<string, string> = {
    chip_code: "Microchip",
    fur: "Pelo",
    color: "Colore",
    breed_id: "Razza",
    sex: "Sesso",
    birth_date: "Data di nascita",
    size: "Taglia",
    entry_date: "Data ingresso",
}
