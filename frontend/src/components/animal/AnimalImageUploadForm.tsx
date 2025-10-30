import { FormProvider, useForm } from "react-hook-form"
import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload"
import { Button } from "primereact/button"
import { useMutation, useQueryClient } from "react-query"
import { Toast } from "primereact/toast"
import { useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faCheckCircle, faImage } from "@fortawesome/free-solid-svg-icons"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { apiService } from "../../main"

const animalImageUploadSchema = z.object({
    image_id: z.number().optional(),
})

type AnimalImageUpload = z.infer<typeof animalImageUploadSchema>

type Props = {
    animalId: string
    onSuccess?: () => void
    onComplete?: () => void
}

const AnimalImageUploadForm = ({ animalId, onSuccess, onComplete }: Props) => {
    const toast = useRef<Toast>(null)

    const form = useForm<AnimalImageUpload>({
        resolver: zodResolver(animalImageUploadSchema),
        defaultValues: {},
    })
    const { handleSubmit, setValue, getValues, reset } = form
    const queryClient = useQueryClient()

    // TODO: This mutation will need to be implemented in the backend
    const uploadAnimalImageMutation = useMutation({
        mutationFn: (file: File) => apiService.uploadAnimalImage(animalId, file),
        onSuccess: (result: any) => {
            setValue("image_id", result)
            toast.current?.show({
                severity: "success",
                detail: "Upload completato.",
            })
        },
        onError: () => {
            toast.current?.show({
                severity: "error",
                detail: "Upload dell'immagine fallito.",
            })
        },
    })

    // TODO: This mutation will need to be implemented in the backend
    const updateAnimalImageMutation = useMutation({
        mutationFn: (data: AnimalImageUpload) => 
            apiService.updateAnimalImage(animalId, { image_id: data.image_id! }),
        onSuccess: () => {
            reset()
            toast.current?.show({
                severity: "success",
                detail: "Immagine aggiornata.",
            })
            // Invalidate animal data to refresh the image
            queryClient.invalidateQueries(["animal", animalId])
            onSuccess?.()
            onComplete?.()
        },
        onError: () => {
            toast.current?.show({
                severity: "error",
                detail: "Aggiornamento dell'immagine fallito.",
            })
        },
    })

    const onSubmit = (data: AnimalImageUpload) => {
        updateAnimalImageMutation.mutate(data)
    }

    const onUpload = async (event: FileUploadHandlerEvent) => {
        uploadAnimalImageMutation.mutate(event.files[0])
    }

    const handleCancel = () => {
        reset()
        onComplete?.()
    }

    return (
        <div className="space-y-4">
            <div className="text-center mb-4">
                <FontAwesomeIcon 
                    icon={faImage} 
                    className="text-gray-400 text-4xl mb-2" 
                />
                <p className="text-gray-600">
                    Carica una nuova immagine per questo animale
                </p>
            </div>

            <FormProvider {...form}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-4 items-center"
                >
                    <div className="flex items-center gap-3 w-full">
                        <FileUpload
                            disabled={uploadAnimalImageMutation.status === "loading"}
                            chooseLabel="Seleziona immagine"
                            customUpload
                            auto
                            accept="image/*"
                            uploadHandler={onUpload}
                            mode="basic"
                            className="w-full"
                        />
                        {getValues("image_id") && (
                            <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="text-green-500 text-lg"
                            />
                        )}
                    </div>

                    <div className="flex gap-2 w-full">
                        <Button
                            type="button"
                            severity="secondary"
                            outlined
                            onClick={handleCancel}
                            className="flex-1"
                            disabled={
                                uploadAnimalImageMutation.status === "loading" ||
                                updateAnimalImageMutation.status === "loading"
                            }
                        >
                            Annulla
                        </Button>
                        <Button
                            type="submit"
                            severity="success"
                            className="flex gap-1 flex-1"
                            disabled={
                                !getValues("image_id") ||
                                uploadAnimalImageMutation.status === "loading" ||
                                updateAnimalImageMutation.status === "loading"
                            }
                        >
                            <FontAwesomeIcon icon={faCheck} fixedWidth />
                            Salva
                        </Button>
                    </div>
                </form>
            </FormProvider>
            <Toast ref={toast} position="bottom-right" />
        </div>
    )
}

export default AnimalImageUploadForm