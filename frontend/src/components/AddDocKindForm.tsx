import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "react-query"
import { DocKind, NewDocKind, newDocKindSchema } from "../models/docs.schema"
import { apiService } from "../main"
import { SubTitle } from "./typography"
import ControlledInputText from "./forms/ControlledInputText"
import { Button } from "primereact/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useRef } from "react"
import { Toast } from "primereact/toast"

type Props = {
    onSuccess?: (docKind: DocKind) => void
}
const AddDocKindForm = (props: Props) => {
    const toast = useRef<Toast>(null)

    const form = useForm<NewDocKind>({
        resolver: zodResolver(newDocKindSchema),
        defaultValues: {},
    })

    const {
        handleSubmit,
        setError,
        formState: { errors },
        reset,
    } = form
    const queryClient = useQueryClient()

    // React Query Mutation for API call
    const createBreed = useMutation({
        mutationFn: (newDocKind: NewDocKind) =>
            apiService.addNewDocKind(newDocKind),
        onSuccess: (result: DocKind, variables: NewDocKind, context) => {
            queryClient.setQueryData(
                "doc-kinds",
                //@ts-ignore
                (old: Updater<DocKind[], DocKind[]>) => [...(old || []), result]
            )
            toast.current?.show({
                severity: "success",
                detail: "Nuovo tipo aggiunto.",
            })
            reset()
            props.onSuccess && props.onSuccess(result)
        },
        onError: () => {
            toast.current?.show({
                severity: "error",
                detail: "Qualcosa è andato sorto.",
            })
        },
        mutationKey: "newBreed",
    })

    // Handle form submission
    const onSubmit = async (data: NewDocKind) => {
        await createBreed.mutateAsync(data)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <SubTitle>Aggiungi una tipo documento</SubTitle>
            <FormProvider {...form}>
                <div className="flex flex-col gap-2 items-start">
                    <ControlledInputText<NewDocKind>
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
            <Toast ref={toast} position="bottom-right" />
        </form>
    )
}

export default AddDocKindForm
