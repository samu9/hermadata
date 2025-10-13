import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { FormProvider, useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "react-query"
import { apiService } from "../main"
import ControlledInputText from "./forms/ControlledInputText"
import { SubTitle } from "./typography"
import { IntUtilItem } from "../models/util.schema"
import { addFurColorSchema, NewFurColor } from "../models/animal.schema"

type Props = {
    onSuccess?: (result: IntUtilItem) => void
}
const AddFurColorForm = (props: Props) => {
    const form = useForm<NewFurColor>({
        resolver: zodResolver(addFurColorSchema),
    })

    const {
        handleSubmit,
        setError,
    } = form
    const queryClient = useQueryClient()

    // React Query Mutation for API call
    const createFurColor = useMutation({
        mutationFn: (newFurColor: NewFurColor) =>
            apiService.addAnimalFurColor(newFurColor),
        onSuccess: (result: IntUtilItem) => {
            queryClient.setQueryData(
                ["fur-color"],
                (old: IntUtilItem[] | undefined) => old ? [...old, result] : [result]
            )
            props.onSuccess && props.onSuccess(result)
        },
        mutationKey: "newFurColor",
    })

    // Handle form submission
    const onSubmit = async (data: NewFurColor) => {
        try {
            // Make API call to create a new dog breed
            await createFurColor.mutateAsync(data)
            // Optionally, you can handle success (e.g., show a success message)
        } catch (error) {
            // Handle API error, and set specific form field errors if needed
            setError("name", {
                type: "manual",
                message: "Nome non valido.",
            })
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <SubTitle>Aggiungi un colore manto</SubTitle>
            <FormProvider {...form}>
                <div className="flex flex-col gap-2 items-start">
                    <ControlledInputText<NewFurColor>
                        fieldName="name"
                        label="Nome"
                        className="w-full"
                    />
                    <Button type="button" onClick={handleSubmit(onSubmit)}>
                        <FontAwesomeIcon
                            icon={faPlus}
                            fixedWidth
                            className="pr-2"
                        />{" "}
                        Aggiungi
                    </Button>
                </div>
            </FormProvider>
        </form>
    )
}

export default AddFurColorForm
