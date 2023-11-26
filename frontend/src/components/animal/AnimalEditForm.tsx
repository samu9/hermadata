import { InputText } from "primereact/inputtext"
import { Controller, FormProvider, useForm } from "react-hook-form"
import {
    AnimalEdit,
    NewAnimalEntry,
    animalEditSchema,
} from "../../models/animal.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { classNames } from "primereact/utils"
import { Divider } from "primereact/divider"
import ControlledInputText from "../forms/ControlledInputText"
import { Button } from "primereact/button"
import { useEffect } from "react"
import ControlledInputDate from "../forms/ControlledInputDate"
import ControlledCheckbox from "../forms/ControlledInputCheckbox"

const AnimalEditForm = () => {
    const form = useForm<AnimalEdit>({
        resolver: zodResolver(animalEditSchema),
        defaultValues: {
            // name: "",
        },
    })

    const {
        control,
        formState: { errors },
        handleSubmit,
        getValues,
        watch,
        reset,
        register,
    } = form

    const onSubmit = (data: AnimalEdit) => {
        console.log(data)
    }

    useEffect(() => {
        console.log(watch())
    }, [watch()])
    return (
        <div>
            <FormProvider {...form}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <h3 className="font-bold">Dati generali</h3>
                        <div className="py-4 flex flex-col gap-2">
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
                            <ControlledInputDate<AnimalEdit>
                                fieldName="entry_date"
                                label="Data ingresso"
                                className="w-52"
                            />
                            <ControlledCheckbox<AnimalEdit>
                                fieldName="sterilized"
                                label="Sterilizzato"
                            />
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
