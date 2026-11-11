import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { FormProvider, useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "react-query"
import { apiService } from "../../main"
import { NewVet, newVetSchema, Vet } from "../../models/vet.schema"
import ControlledInputText from "../forms/ControlledInputText"

type Props = {
    onSaved?: (result: Vet) => void
}

const NewVetForm = (props: Props) => {
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
                                fieldName="business_name"
                                label="Ragione sociale"
                                className="w-full sm:w-64"
                            />

                            <ControlledInputText
                                fieldName="fiscal_code"
                                label="Codice fiscale"
                                className="w-full sm:w-64"
                            />
                        </div>
                        <ControlledInputText
                            fieldName="phone"
                            label="Telefono"
                            className="w-full sm:w-64"
                        />
                    </div>
                    <Button label="Salva" size="small" />
                </form>
            </FormProvider>
        </div>
    )
}

export default NewVetForm
