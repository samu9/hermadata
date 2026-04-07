import React from "react"
import { Toast } from "primereact/toast"

class ToastService {
    private toastRef: React.RefObject<Toast> | null = null

    setToastRef(ref: React.RefObject<Toast>) {
        this.toastRef = ref
    }

    showSuccess(message: string, summary: string = "Successo") {
        this.toastRef?.current?.show({
            severity: "success",
            summary,
            detail: message,
            life: 3000,
        })
    }

    showError(
        message: string | React.ReactNode,
        summary: string = "Errore",
    ) {
        this.toastRef?.current?.show({
            severity: "error",
            summary,
            detail: message,
            life: 5000,
        })
    }

    showWarn(
        message: string | React.ReactNode,
        summary: string = "Attenzione",
        life: number = 8000,
    ) {
        this.toastRef?.current?.show({
            severity: "warn",
            summary,
            detail: message,
            life,
        })
    }

    clear() {
        this.toastRef?.current?.clear()
    }
}

export const toastService = new ToastService()
