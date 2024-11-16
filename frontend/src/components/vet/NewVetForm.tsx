import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "react-query"
import { apiService } from "../../main"
import { NewVet, newVetSchema, Vet } from "../../models/vet.schema"
import { useComuniQuery } from "../../queries"
import ControlledInputText from "../forms/ControlledInputText"

type Props = {
    onSaved?: (result: Vet) => void
}

const NewVetForm = (props: Props) => {
    const [provinciaNascita, setProvinciaNascita] = useState<string>()
    const [provinciaResidenza, setProvinciaResidenza] = useState<string>()

    const comuneNascitaQuery = useComuniQuery(provinciaNascita)
    const comuneResidenzaQuery = useComuniQuery(provinciaResidenza)

    const form = useForm<NewVet>({
        resolver: zodResolver(newVetSchema),
    })
    const queryClient = useQueryClient()

    const newVetMutation = useMutation({
        mutationKey: "new-vet",
        mutationFn: (data: NewVet) => apiService.newVet(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ["vet-search"],
            })
            props.onSaved?.(data)
        },
    })
    const { handleSubmit } = form
    const onSubmit = (data: NewVet) => {
        newVetMutation.mutate(data)
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
                                fieldName="business_name"
                                label="Ragione sociale"
                                className="w-64"
                            />

                            <ControlledInputText
                                fieldName="fiscal_code"
                                label="Codice fiscale"
                                className="w-64"
                            />
                        </div>
                        <ControlledInputText
                            fieldName="phone"
                            label="Telefono"
                            className="w-64"
                        />
                    </div>
                    <Button label="Salva" size="small" />
                </form>
            </FormProvider>
        </div>
    )
}

export default NewVetForm
