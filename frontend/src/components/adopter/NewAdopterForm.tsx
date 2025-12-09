import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "react-query"
import { apiService } from "../../main"
import {
    Adopter,
    NewAdopter,
    newAdopterSchema,
} from "../../models/adopter.schema"
import { useComuniQuery } from "../../queries"
import ControlledDropdown from "../forms/ControlledDropdown"
import ControlledInputText from "../forms/ControlledInputText"
import UncontrolledProvinceDropdown from "../forms/uncontrolled/UncontrolledProvinceDropdown"

type Props = {
    onSaved?: (result: Adopter) => void
}

const NewAdopterForm = (props: Props) => {
    const [provinciaResidenza, setProvinciaResidenza] = useState<string>()

    const comuneResidenzaQuery = useComuniQuery(provinciaResidenza)

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
    })
    const { handleSubmit } = form
    const onSubmit = (data: NewAdopter) => {
        newAdopterMutation.mutate(data)
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
