import { faImage, faStar, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { classNames } from "primereact/utils"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { useParams } from "react-router-dom"
import { Permission } from "../../constants"
import { useAuth } from "../../contexts/AuthContext"
import { apiService } from "../../main"
import { toastService } from "../../services/toast"
import AnimalImageUploadForm from "./AnimalImageUploadForm"

const AnimalGallery = () => {
    const { id: animalIdStr } = useParams()
    const animalId = Number(animalIdStr)
    const queryClient = useQueryClient()
    const { can } = useAuth()
    const canManageImages = can(Permission.UPLOAD_ANIMAL_IMAGE)
    const [uploadDialogVisible, setUploadDialogVisible] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

    const imagesQuery = useQuery(
        ["animal-images", animalId],
        () => apiService.listAnimalImages(animalId),
        { enabled: !!animalId },
    )

    const setProfileMutation = useMutation(
        (imageId: number) => apiService.setProfileImage(animalId, imageId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["animal-images", animalId])
                queryClient.invalidateQueries(["animal", animalIdStr])
                toastService.showSuccess("Foto profilo aggiornata")
            },
            onError: () => toastService.showError("Operazione fallita"),
        },
    )

    const deleteMutation = useMutation(
        (imageId: number) => apiService.deleteAnimalImage(animalId, imageId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["animal-images", animalId])
                queryClient.invalidateQueries(["animal", animalIdStr])
                setDeleteTarget(null)
                toastService.showSuccess("Immagine eliminata")
            },
            onError: () => toastService.showError("Eliminazione fallita"),
        },
    )

    const images = imagesQuery.data ?? []

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-surface-800">
                    Galleria immagini
                </h2>
                {canManageImages && (
                    <Button
                        size="small"
                        severity="secondary"
                        outlined
                        onClick={() => setUploadDialogVisible(true)}
                    >
                        <FontAwesomeIcon icon={faUpload} className="mr-2" />
                        Aggiungi
                    </Button>
                )}
            </div>

            {imagesQuery.isLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Array(4)
                        .fill(0)
                        .map((_, i) => (
                            <div
                                key={i}
                                className="aspect-square bg-surface-100 rounded-xl animate-pulse"
                            />
                        ))}
                </div>
            )}

            {!imagesQuery.isLoading && images.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-surface-400 gap-3">
                    <FontAwesomeIcon icon={faImage} className="text-5xl" />
                    <p className="text-sm">Nessuna immagine caricata</p>
                    {canManageImages && (
                        <Button
                            size="small"
                            severity="secondary"
                            onClick={() => setUploadDialogVisible(true)}
                        >
                            <FontAwesomeIcon icon={faUpload} className="mr-2" />
                            Carica la prima immagine
                        </Button>
                    )}
                </div>
            )}

            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((img) => (
                        <div
                            key={img.id}
                            className={classNames(
                                "relative group aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200",
                                img.is_profile
                                    ? "border-amber-400 shadow-md"
                                    : "border-surface-200 hover:border-surface-300",
                            )}
                        >
                            <img
                                src={apiService.getAnimalImageUrl(
                                    animalId,
                                    img.id,
                                )}
                                alt={img.filename}
                                className="w-full h-full object-cover"
                            />

                            {img.is_profile && (
                                <div className="absolute top-2 left-2 bg-amber-400 text-white rounded-full p-1 text-xs leading-none shadow">
                                    <FontAwesomeIcon icon={faStar} />
                                </div>
                            )}

                            {canManageImages && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-2 gap-2">
                                    {!img.is_profile && (
                                        <Button
                                            size="small"
                                            severity="warning"
                                            title="Imposta come profilo"
                                            onClick={() =>
                                                setProfileMutation.mutate(
                                                    img.id,
                                                )
                                            }
                                            loading={
                                                setProfileMutation.isLoading &&
                                                setProfileMutation.variables ===
                                                    img.id
                                            }
                                            className="text-xs"
                                        >
                                            <FontAwesomeIcon
                                                icon={faStar}
                                                className="mr-1"
                                            />
                                            Profilo
                                        </Button>
                                    )}
                                    <Button
                                        size="small"
                                        severity="danger"
                                        title="Elimina"
                                        onClick={() =>
                                            setDeleteTarget(img.id)
                                        }
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Dialog
                header="Aggiungi immagine"
                visible={uploadDialogVisible}
                style={{ width: "90vw", maxWidth: "460px" }}
                onHide={() => setUploadDialogVisible(false)}
                modal
                resizable={false}
                draggable={false}
            >
                <AnimalImageUploadForm
                    animalId={animalId}
                    onComplete={() => setUploadDialogVisible(false)}
                />
            </Dialog>

            <Dialog
                header="Conferma eliminazione"
                visible={deleteTarget !== null}
                style={{ width: "360px" }}
                onHide={() => setDeleteTarget(null)}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button
                            label="Annulla"
                            severity="secondary"
                            outlined
                            onClick={() => setDeleteTarget(null)}
                        />
                        <Button
                            label="Elimina"
                            severity="danger"
                            loading={deleteMutation.isLoading}
                            onClick={() =>
                                deleteTarget !== null &&
                                deleteMutation.mutate(deleteTarget)
                            }
                        />
                    </div>
                }
            >
                <p>Sei sicuro di voler eliminare questa immagine?</p>
            </Dialog>
        </div>
    )
}

export default AnimalGallery
