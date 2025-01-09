export enum ApiErrorCode {
    existingChipCode = "ECC",
}

export type SeverityType =
    | "success"
    | "secondary"
    | "info"
    | "warning"
    | "danger"
    | "help"
    | undefined
