import { FormProvider, useForm } from "react-hook-form"
import { NewAdopter, newAdopterSchema } from "../../models/adopter.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import ControlledInputText from "../forms/ControlledInputText"
import ControlledInputDate from "../forms/ControlledInputDate"
import { Divider } from "primereact/divider"
import { Button } from "primereact/button"
import { useComuniQuery } from "../../queries"
import ControlledDropdown from "../forms/ControlledDropdown"
import { useState } from "react"
import UncontrolledProvinceDropdown from "../forms/uncontrolled/UncontrolledProvinceDropdown"
import { PageTitle } from "../typography"
import { useMutation } from "react-query"
import { apiService } from "../../main"

const NewAdopterForm = () => {
    const [provinciaNascita, setProvinciaNascita] = useState<string>()
    const [provinciaResidenza, setProvinciaResidenza] = useState<string>()

    const comuneNascitaQuery = useComuniQuery(provinciaNascita)
    const comuneResidenzaQuery = useComuniQuery(provinciaResidenza)

    const form = useForm<NewAdopter>({
        resolver: zodResolver(newAdopterSchema),
    })

    const newAdopterMutation = useMutation({
        mutationKey: "new-adopter",
        mutationFn: (data: NewAdopter) => apiService.newAdopter(data),
        onSuccess: () => {},
    })
    const { handleSubmit } = form
    const onSubmit = (data: NewAdopter) => {
        newAdopterMutation.mutate(data)
    }
    return (
        <div>
            <PageTitle>Nuovo adottante</PageTitle>
            <FormProvider {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="">
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
                        <ControlledInputText
                            fieldName="fiscal_code"
                            label="Codice fiscale"
                            className="w-64"
                        />
                        <ControlledInputDate
                            fieldName="birth_date"
                            label="Data di nascita"
                            className="w-64"
                        />
                        <div className="flex gap-2">
                            <UncontrolledProvinceDropdown
                                onChange={(value) => setProvinciaNascita(value)}
                                className="w-64"
                            />
                            <ControlledDropdown
                                label="Comune di nascita"
                                disabled={!comuneNascitaQuery.data}
                                optionLabel="name"
                                optionValue="id"
                                options={comuneNascitaQuery.data}
                                fieldName="birth_city_code"
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
                        <ControlledInputText
                            fieldName="phone"
                            label="Telefono"
                            className="w-64"
                        />
                    </div>
                    <Divider />
                    <Button>Salva</Button>
                </form>
            </FormProvider>
        </div>
    )
}

export default NewAdopterForm
