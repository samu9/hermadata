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
}

export type SeverityType =
    | "success"
    | "secondary"
    | "info"
    | "warning"
    | "danger"
    | "help"
    | undefined
