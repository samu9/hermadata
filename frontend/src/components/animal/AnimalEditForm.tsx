import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { Divider } from "primereact/divider"
import { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useLocation, useParams } from "react-router-dom"
import { apiService } from "../../main"
import { AnimalEdit, animalEditSchema } from "../../models/animal.schema"
import ControlledCheckbox from "../forms/ControlledCheckbox"
import ControlledInputDate from "../forms/ControlledInputDate"
import ControlledInputText from "../forms/ControlledInputText"
import ControlledRadio from "../forms/ControlledRadio"

const AnimalEditForm = () => {
    const { id } = useParams()
    const location = useLocation()
    const form = useForm<AnimalEdit>({
        resolver: zodResolver(animalEditSchema),
        defaultValues: { ...animalEditSchema.parse(location.state) },
    })

    const {
        formState: { errors },
        handleSubmit,
        watch,
    } = form

    const onSubmit = async (data: AnimalEdit) => {
        if (!id) {
            return false
        }
        const result = await apiService.updateAnimal(id, data)

        return result
    }

    return (
        <div>
            <FormProvider {...form}>
                <form onSubmit={handleSubmit(onSubmit, (e) => console.log(e))}>
                    <div>
                        <h3 className="font-bold">Dati generali</h3>
                        <div className="pb-4 flex flex-col gap-2">
                            <ControlledInputText<AnimalEdit>
                                fieldName="name"
                                label="Nome"
                                className="w-52"
                            />
                            <ControlledInputText<AnimalEdit>
                                fieldName="chip_code"
                                label="Chip"
                                className="w-52"
                            />
                            <div className="flex gap-4">
                                <ControlledInputDate<AnimalEdit>
                                    fieldName="entry_date"
                                    label="Data ingresso"
                                    className="w-32"
                                />
                                {/* <ControlledDropdown<AnimalEdit, ProvinciaSchema>
                                    options={[{ name: "Test", id: "1" }]}
                                    optionLabel="name"
                                    optionValue="id"
                                    fieldName="rescue_province"
                                    label="Provincia ritrovamento"
                                    disabled
                                    className="w-52"
                                /> */}
                            </div>
                            <div className="flex flex-row gap-4 py-2">
                                <ControlledCheckbox<AnimalEdit>
                                    fieldName="sterilized"
                                    label="Sterilizzato"
                                />
                                <ControlledRadio<AnimalEdit, number>
                                    fieldName="sex"
                                    values={[
                                        { value: 0, label: "Maschio" },
                                        { value: 1, label: "Femmina" },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                    <Divider />
                    <Button type="submit">Salva</Button>
                </form>
            </FormProvider>
        </div>
    )
}

export default AnimalEditForm
