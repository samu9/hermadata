import { faFile, faFilePdf, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { format } from "date-fns"
import { Button } from "primereact/button"
import { Checkbox } from "primereact/checkbox"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Dialog } from "primereact/dialog"
import { useEffect, useState } from "react"
import { useQueryClient } from "react-query"
import { useParams } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useToolbar } from "../../contexts/Toolbar"
import { apiService } from "../../main"
import { DocKind } from "../../models/docs.schema"
import { useAnimalDocumentsQuery, useDocKindsQuery } from "../../queries"
import { toastService } from "../../services/toast"
import AnimalDocUploadForm from "./AnimalDocUploadForm"

type DocRow = {
    id: number
    kind: string
    created_at: Date | null
}

const AnimalDocs = () => {
    const { id } = useParams()
    const animalId = parseInt(id!)
    const { isSuperUser } = useAuth()
    const queryClient = useQueryClient()

    const docKindsQuery = useDocKindsQuery()

    const docKindsMap =
        docKindsQuery.data?.reduce(
            (result: { [key: string]: string }, current: DocKind) => {
                result[current.code] = current.name
                return result
            },
            {}
        ) || {}

    const animalDocumentsQuery = useAnimalDocumentsQuery(animalId)
    const { addButton, removeButton } = useToolbar()

    const [docToDelete, setDocToDelete] = useState<DocRow | null>(null)
    const [permanent, setPermanent] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const buttonId = "new-animal-doc"

        // Add the button on mount
        addButton({
            id: buttonId,
            buttonText: "Inserisci documento",
            buttonIcon: faFile,
            FormComponent: AnimalDocUploadForm,
            onSuccessAction: (data) => {
                console.log("Animal document added:", data)
            },
        })

        // Remove the button on unmount
        return () => {
            removeButton(buttonId)
        }
    }, [])

    const openDeleteDialog = (row: DocRow) => {
        setDocToDelete(row)
        setPermanent(false)
    }

    const closeDeleteDialog = () => {
        setDocToDelete(null)
        setPermanent(false)
    }

    const confirmDelete = async () => {
        if (!docToDelete) return
        try {
            setIsDeleting(true)
            await apiService.deleteAnimalDocument(
                animalId,
                docToDelete.id,
                isSuperUser && permanent
            )
            await queryClient.invalidateQueries(["animal-documents", animalId])
            toastService.showSuccess(
                isSuperUser && permanent
                    ? "Documento eliminato definitivamente"
                    : "Documento eliminato"
            )
            closeDeleteDialog()
        } catch (error) {
            console.error("Failed to delete document", error)
        } finally {
            setIsDeleting(false)
        }
    }

    const rows: DocRow[] =
        animalDocumentsQuery.data?.map((d) => ({
            id: d.document_id,
            kind: docKindsMap[d.document_kind_code],
            created_at: d.created_at,
        })) || []

    return (
        <div>
            <DataTable
                emptyMessage="Nessun documento trovato"
                onRowClick={(e) => apiService.openDocument((e.data as DocRow).id)}
                rowClassName={() => "cursor-pointer"}
                value={rows}
                showHeaders={false}
                dataKey="id"
            >
                <Column field="kind" style={{ width: "100%" }} />
                <Column
                    body={(data: DocRow) =>
                        data.created_at
                            ? format(data.created_at, "dd/MM/y")
                            : "-"
                    }
                />
                <Column body={() => <FontAwesomeIcon icon={faFilePdf} />} />
                <Column
                    style={{ width: "3rem" }}
                    body={(data: DocRow) => (
                        <Button
                            type="button"
                            icon={<FontAwesomeIcon icon={faTrash} />}
                            size="small"
                            severity="danger"
                            text
                            tooltip="Elimina documento"
                            onClick={(e) => {
                                e.stopPropagation()
                                openDeleteDialog(data)
                            }}
                        />
                    )}
                />
            </DataTable>

            <Dialog
                header="Elimina documento"
                visible={docToDelete !== null}
                style={{ width: "420px" }}
                onHide={closeDeleteDialog}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button
                            label="Annulla"
                            icon="pi pi-times"
                            onClick={closeDeleteDialog}
                            className="p-button-text"
                            disabled={isDeleting}
                        />
                        <Button
                            label="Elimina"
                            icon="pi pi-trash"
                            severity="danger"
                            onClick={confirmDelete}
                            loading={isDeleting}
                        />
                    </div>
                }
            >
                <div className="flex flex-col gap-4">
                    <p className="m-0">
                        Sei sicuro di voler eliminare questo documento?
                    </p>
                    {isSuperUser && (
                        <div className="flex items-start gap-2">
                            <Checkbox
                                inputId="permanent-delete"
                                checked={permanent}
                                onChange={(e) =>
                                    setPermanent(e.checked ?? false)
                                }
                            />
                            <label
                                htmlFor="permanent-delete"
                                className="text-sm leading-tight"
                            >
                                Elimina definitivamente (rimuove anche il file
                                dallo storage). Questa azione non può essere
                                annullata.
                            </label>
                        </div>
                    )}
                </div>
            </Dialog>
        </div>
    )
}

export default AnimalDocs
