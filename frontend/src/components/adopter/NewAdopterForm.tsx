import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { FormProvider, useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "react-query"
import { apiService } from "../../main"
import { AxiosError } from "axios"
import {
    Adopter,
    NewAdopter,
    newAdopterSchema,
} from "../../models/adopter.schema"
import ControlledCityPicker from "../forms/city/ControlledCityPicker"
import ControlledDropdown from "../forms/ControlledDropdown"
import ControlledInputText from "../forms/ControlledInputText"

type Props = {
    onSaved?: (result: Adopter) => void
}

const NewAdopterForm = (props: Props) => {
    const form = useForm<NewAdopter>({
        resolver: zodResolver(newAdopterSchema),
    })
    const queryClient = useQueryClient()

    const newAdopterMutation = useMutation({
        mutationKey: "new-adopter",
        mutationFn: (data: NewAdopter) => apiService.newAdopter(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ["adopter-search"],
            })
            props.onSaved?.(data)
        },
        onError: (error: AxiosError) => {
            if (error.response?.data) {
                const detail = (error.response.data as any).detail
                if (detail === "Codice fiscale non valido.") {
                    setError("fiscal_code", {
                        type: "manual",
                        message: "Codice fiscale non valido",
                    })
                }
            }
        },
    })
    const { handleSubmit, setError } = form
    const onSubmit = (data: NewAdopter) => {
        newAdopterMutation.mutate(data)
    }
    return (
        <div>
            <FormProvider {...form}>
                <form
                    onSubmit={(e) => {
                        // React bubbles submit events through portals
                        // (e.g. a Dialog) up to any enclosing form.
                        e.stopPropagation()
                        handleSubmit(onSubmit)(e)
                    }}
                    className="flex flex-col gap-2 items-start w-full"
                >
                    <div className="flex flex-col gap-2 items-start w-full">
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <ControlledInputText
                                fieldName="name"
                                label="Nome"
                                className="w-full sm:w-64"
                            />
                            <ControlledInputText
                                fieldName="surname"
                                label="Cognome"
                                className="w-full sm:w-64"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <ControlledInputText
                                fieldName="fiscal_code"
                                label="Codice fiscale"
                                uppercase
                                className="w-full sm:w-64"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <ControlledCityPicker
                                provinciaLabel="Provincia residenza"
                                comuneLabel="Comune di residenza"
                                fieldName="residence_city_code"
                                className="w-full sm:w-64"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <ControlledDropdown
                                label="Tipo documento"
                                optionLabel="name"
                                optionValue="id"
                                options={[
                                    { name: "Carta di identità", id: "id" },
                                    { name: "Patente di guida", id: "dl" },
                                    { name: "Passaporto", id: "pa" },
                                ]}
                                fieldName="document_type"
                                className="w-full sm:w-64"
                            />
                            <ControlledInputText
                                fieldName="document_number"
                                label="Numero documento"
                                className="w-full sm:w-64"
                            />
                        </div>
                        <ControlledInputText
                            fieldName="phone"
                            label="Telefono"
                            className="w-full sm:w-64"
                        />
                    </div>
                    <div className="mt-4">
                        <Button
                            label="Salva nuovo adottante"
                            icon="pi pi-check"
                            className="!bg-primary-600 !border-primary-600 hover:!bg-primary-700"
                        />
                    </div>
                </form>
            </FormProvider>
        </div>
    )
}

export default NewAdopterForm
