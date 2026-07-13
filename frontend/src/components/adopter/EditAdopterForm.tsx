import { zodResolver } from "@hookform/resolvers/zod"
import { AxiosError } from "axios"
import { Button } from "primereact/button"
import { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "react-query"
import { apiService } from "../../main"
import { Adopter, NewAdopter, newAdopterSchema } from "../../models/adopter.schema"
import { useComuneQuery, useComuniQuery } from "../../queries"
import { toastService } from "../../services/toast"
import ControlledDropdown from "../forms/ControlledDropdown"
import ControlledInputText from "../forms/ControlledInputText"
import UncontrolledProvinceDropdown from "../forms/uncontrolled/UncontrolledProvinceDropdown"

type Props = {
    adopter: Adopter
}

const EditAdopterForm = ({ adopter }: Props) => {
    // Resolve the residence province from the current residence city code so
    // the province dropdown can pre-select it and load the comuni list.
    const residenceComuneQuery = useComuneQuery(adopter.residence_city_code)
    const [provinciaResidenza, setProvinciaResidenza] = useState<string>()

    useEffect(() => {
        if (residenceComuneQuery.data?.provincia) {
            setProvinciaResidenza(residenceComuneQuery.data.provincia)
        }
    }, [residenceComuneQuery.data])

    const comuneResidenzaQuery = useComuniQuery(provinciaResidenza)

    const form = useForm<NewAdopter>({
        resolver: zodResolver(newAdopterSchema),
        defaultValues: {
            name: adopter.name,
            surname: adopter.surname,
            fiscal_code: adopter.fiscal_code,
            residence_city_code: adopter.residence_city_code,
            phone: adopter.phone,
            document_type: adopter.document_type ?? undefined,
            document_number: adopter.document_number ?? undefined,
        },
    })
    const queryClient = useQueryClient()
    const { handleSubmit, setError } = form

    const updateAdopterMutation = useMutation({
        mutationKey: ["update-adopter", adopter.id],
        mutationFn: (data: NewAdopter) =>
            apiService.updateAdopter(adopter.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["adopter", adopter.id],
            })
            queryClient.invalidateQueries({ queryKey: ["adopter-search"] })
            toastService.showSuccess("Adottante aggiornato")
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

    const onSubmit = (data: NewAdopter) => {
        updateAdopterMutation.mutate(data)
    }

    return (
        <div>
            <FormProvider {...form}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-2 items-start"
                >
                    <div className="flex flex-col gap-2 items-start">
                        <div className="flex gap-2">
                            <ControlledInputText
                                fieldName="name"
                                label="Nome"
                                className="w-64"
                            />
                            <ControlledInputText
                                fieldName="surname"
                                label="Cognome"
                                className="w-64"
                            />
                        </div>
                        <div className="flex gap-2">
                            <ControlledInputText
                                fieldName="fiscal_code"
                                label="Codice fiscale"
                                uppercase
                                className="w-64"
                            />
                        </div>
                        <div className="flex gap-2">
                            <UncontrolledProvinceDropdown
                                label="Provincia residenza"
                                value={provinciaResidenza}
                                onChange={(value) =>
                                    setProvinciaResidenza(value)
                                }
                                className="w-64"
                            />
                            <ControlledDropdown
                                label="Comune di residenza"
                                disabled={!comuneResidenzaQuery.data}
                                optionLabel="name"
                                optionValue="id"
                                options={comuneResidenzaQuery.data}
                                fieldName="residence_city_code"
                                className="w-64"
                            />
                        </div>

                        <div className="flex gap-2">
                            <ControlledDropdown
                                label="Tipo documento"
                                optionLabel="name"
                                optionValue="id"
                                options={[
                                    { name: "Carta di identità", id: "id" },
                                    { name: "Patente di guida", id: "dl" },
                                ]}
                                fieldName="document_type"
                                className="w-64"
                            />
                            <ControlledInputText
                                fieldName="document_number"
                                label="Numero documento"
                                className="w-64"
                            />
                        </div>
                        <ControlledInputText
                            fieldName="phone"
                            label="Telefono"
                            className="w-64"
                        />
                    </div>
                    <div className="mt-4">
                        <Button
                            label="Salva modifiche"
                            icon="pi pi-check"
                            loading={updateAdopterMutation.isLoading}
                            className="!bg-primary-600 !border-primary-600 hover:!bg-primary-700"
                        />
                    </div>
                </form>
            </FormProvider>
        </div>
    )
}

export default EditAdopterForm
