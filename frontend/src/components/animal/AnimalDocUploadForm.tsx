import { FormProvider, useForm } from "react-hook-form"
import ControlledInputText from "../forms/ControlledInputText"
import {
    AnimalDocUpload,
    AnimalDocument,
    animalDocUploadSchema,
} from "../../models/animal.schema"
import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload"
import { useDocKindsQuery } from "../../queries"
import ControlledDropdown from "../forms/ControlledDropdown"
import { zodResolver } from "@hookform/resolvers/zod"
import { apiService } from "../../main"
import { Button } from "primereact/button"
import { useMutation, useQueryClient } from "react-query"
import { Toast } from "primereact/toast"
import { useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faCheckCircle } from "@fortawesome/free-solid-svg-icons"
import { useParams } from "react-router-dom"
import { Updater } from "react-query/types/core/utils"

type Props = {
    onSuccess?: (doc: AnimalDocument) => void
}
const AnimalDocUploadForm = (props: Props) => {
    const { id } = useParams()

    const toast = useRef<Toast>(null)

    const form = useForm<AnimalDocUpload>({
        resolver: zodResolver(animalDocUploadSchema),
        defaultValues: {
            title: undefined,
        },
    })
    const { handleSubmit, setValue, getValues, reset } = form
    const docKindsQuery = useDocKindsQuery()
    const queryClient = useQueryClient()

    const newAnimalDocumentMutation = useMutation({
        mutationFn: (data: AnimalDocUpload) =>
            apiService.newAnimalDocument(parseInt(id!), data),
        onSuccess: (result: AnimalDocument) => {
            reset()
            toast.current?.show({
                severity: "success",
                detail: "Documento aggiunto.",
            })
            queryClient.setQueryData(
                ["animal-documents", parseInt(id!)],
                (old: Updater<AnimalDocument[], AnimalDocument[]>) => [
                    //@ts-ignore
                    ...old,
                    result,
                ]
            )
            props.onSuccess && props.onSuccess(result)
        },
    })

    const onSubmit = (data: AnimalDocUpload) => {
        console.log(data)
        newAnimalDocumentMutation.mutate(data)
    }

    const uploadDocMutation = useMutation({
        mutationFn: (file: File) => apiService.uploadDoc(file),
        onSuccess: (result: number, variables, context) => {
            setValue("document_id", result)
            toast.current?.show({
                severity: "success",
                detail: "Upload completato.",
            })
        },
        onError: (error, variables, context) => {
            toast.current?.show({
                severity: "error",
                detail: "Upload del documento fallito.",
            })
        },
    })

    const onUpload = async (event: FileUploadHandlerEvent) => {
        uploadDocMutation.mutate(event.files[0])
    }
    return (
        <div>
            <FormProvider {...form}>
                <form
                    onSubmit={handleSubmit(onSubmit, (e) => console.log(e))}
                    className="flex flex-col gap-2 items-start"
                >
                    <ControlledInputText
                        label="Titolo"
                        fieldName="title"
                        className="w-full"
                    />
                    <ControlledDropdown
                        label="Tipo"
                        fieldName="document_kind_id"
                        optionLabel="name"
                        optionValue="id"
                        options={docKindsQuery.data}
                        className="w-full"
                    />
                    <div className="flex items-center gap-3">
                        <FileUpload
                            disabled={uploadDocMutation.status == "loading"}
                            chooseLabel="Seleziona il file"
                            customUpload
                            auto
                            accept="application/pdf"
                            uploadHandler={onUpload}
                            // onSelect={(e) => {
                            //     toast.current?.show({
                            //         severity: "info",
                            //         detail: "Clicca sul pulsante per completare l'upload del file.",
                            //     })
                            // }}
                            mode="basic"
                            uploadLabel="Carica"
                            className="w-full"
                        />
                        {getValues("document_id") && (
                            <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="text-green-500 text-lg"
                            />
                        )}
                    </div>
                    <Button
                        disabled={
                            uploadDocMutation.status == "loading" ||
                            newAnimalDocumentMutation.status == "loading"
                        }
                        severity="success"
                        className="flex gap-1"
                    >
                        <FontAwesomeIcon icon={faCheck} fixedWidth />
                        Salva
                    </Button>
                </form>
            </FormProvider>
            <Toast ref={toast} position="bottom-right" />
        </div>
    )
}

export default AnimalDocUploadForm
