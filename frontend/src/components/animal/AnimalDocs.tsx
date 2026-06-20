import {
    faFile,
    faFilePdf,
    faRotate,
    faTrash,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { format } from "date-fns"
import { Button } from "primereact/button"
import { Checkbox } from "primereact/checkbox"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Dialog } from "primereact/dialog"
import { Tag } from "primereact/tag"
import { useEffect, useMemo, useState } from "react"
import { useQueryClient } from "react-query"
import { useParams } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useToolbar } from "../../contexts/Toolbar"
import { apiService } from "../../main"
import { AnimalEntry } from "../../models/animal.schema"
import { DocKind } from "../../models/docs.schema"
import {
    useAnimalDocumentsQuery,
    useAnimalEntriesQuery,
    useDocKindsQuery,
    useEntryTypesQuery,
    useExitTypesQuery,
} from "../../queries"
import { toastService } from "../../services/toast"
import AnimalDocUploadForm from "./AnimalDocUploadForm"

type DocRow = {
    documentId: number
    kindName: string
    title: string | null | undefined
    dirty: boolean
    rerenderable: boolean
    entry: AnimalEntry | undefined
    created_at: Date | null
}

const AnimalDocs = () => {
    const { id } = useParams()
    const animalId = parseInt(id!)
    const { isSuperUser } = useAuth()
    const queryClient = useQueryClient()

    const docKindsQuery = useDocKindsQuery()
    const animalDocumentsQuery = useAnimalDocumentsQuery(animalId)
    const entriesQuery = useAnimalEntriesQuery(id!)
    const entryTypesQuery = useEntryTypesQuery()
    const exitTypesQuery = useExitTypesQuery()
    const { addButton, removeButton } = useToolbar()

    const docKindsMap = useMemo(
        () =>
            docKindsQuery.data?.reduce(
                (result: { [key: string]: string }, current: DocKind) => {
                    result[current.code] = current.name
                    return result
                },
                {}
            ) || {},
        [docKindsQuery.data]
    )

    const entriesById = useMemo(
        () =>
            (entriesQuery.data || []).reduce(
                (m: { [key: number]: AnimalEntry }, e) => {
                    m[e.id] = e
                    return m
                },
                {}
            ),
        [entriesQuery.data]
    )

    const entryTypeLabel = (code?: string | null) =>
        (code && entryTypesQuery.data?.find((t) => t.id === code)?.label) ||
        code ||
        ""
    const exitTypeLabel = (code?: string | null) =>
        (code && exitTypesQuery.data?.find((t) => t.id === code)?.label) ||
        code ||
        ""

    const [docToDelete, setDocToDelete] = useState<DocRow | null>(null)
    const [permanent, setPermanent] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [docToRerender, setDocToRerender] = useState<DocRow | null>(null)
    const [isRerendering, setIsRerendering] = useState(false)

    useEffect(() => {
        const buttonId = "new-animal-doc"
        addButton({
            id: buttonId,
            buttonText: "Inserisci documento",
            buttonIcon: faFile,
            FormComponent: AnimalDocUploadForm,
            onSuccessAction: (data) => {
                console.log("Animal document added:", data)
            },
        })
        return () => {
            removeButton(buttonId)
        }
    }, [])

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
                docToDelete.documentId,
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

    const confirmRerender = async () => {
        if (!docToRerender) return
        try {
            setIsRerendering(true)
            await apiService.rerenderAnimalDocument(
                animalId,
                docToRerender.documentId
            )
            await queryClient.invalidateQueries(["animal-documents", animalId])
            toastService.showSuccess("Documento rigenerato")
            setDocToRerender(null)
        } catch (error) {
            console.error("Failed to re-render document", error)
        } finally {
            setIsRerendering(false)
        }
    }

    const rows: DocRow[] =
        animalDocumentsQuery.data?.map((d) => ({
            documentId: d.document_id,
            kindName:
                d.document_kind_name ||
                docKindsMap[d.document_kind_code] ||
                d.document_kind_code,
            title: d.title,
            dirty: d.dirty,
            rerenderable: d.rerenderable,
            entry:
                d.animal_entry_id != null
                    ? entriesById[d.animal_entry_id]
                    : undefined,
            created_at: d.created_at,
        })) || []

    const describeEntry = (entry: AnimalEntry) => {
        const parts: string[] = []
        if (entry.entry_date) {
            parts.push(
                `Ingresso ${format(new Date(entry.entry_date), "dd/MM/y")}` +
                    (entry.entry_type
                        ? ` · ${entryTypeLabel(entry.entry_type)}`
                        : "")
            )
        }
        if (entry.exit_date) {
            parts.push(
                `Uscita ${format(new Date(entry.exit_date), "dd/MM/y")}` +
                    (entry.exit_type
                        ? ` · ${exitTypeLabel(entry.exit_type)}`
                        : "")
            )
        }
        return parts.join(" — ")
    }

    const documentBody = (row: DocRow) => (
        <div className="flex flex-col gap-0.5 py-1">
            <div className="flex items-center gap-2">
                <span className="font-medium">{row.kindName}</span>
                {row.dirty && (
                    <Tag
                        severity="warning"
                        value="Da rigenerare"
                        icon="pi pi-exclamation-triangle"
                    />
                )}
            </div>
            {row.title && row.title !== row.kindName && (
                <span className="text-sm text-surface-600">{row.title}</span>
            )}
            {row.entry && (
                <span className="text-xs text-surface-500">
                    {describeEntry(row.entry)}
                </span>
            )}
        </div>
    )

    return (
        <div>
            <DataTable
                emptyMessage="Nessun documento trovato"
                onRowClick={(e) =>
                    apiService.openDocument((e.data as DocRow).documentId)
                }
                rowClassName={() => "cursor-pointer"}
                value={rows}
                showHeaders={false}
                dataKey="documentId"
            >
                <Column body={documentBody} style={{ width: "100%" }} />
                <Column
                    body={(data: DocRow) =>
                        data.created_at
                            ? format(data.created_at, "dd/MM/y")
                            : "-"
                    }
                />
                <Column body={() => <FontAwesomeIcon icon={faFilePdf} />} />
                <Column
                    style={{ width: "6rem" }}
                    body={(data: DocRow) => (
                        <div className="flex justify-end gap-1">
                            {data.rerenderable && (
                                <Button
                                    type="button"
                                    icon={<FontAwesomeIcon icon={faRotate} />}
                                    size="small"
                                    severity={
                                        data.dirty ? "warning" : "secondary"
                                    }
                                    text
                                    tooltip="Rigenera documento"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setDocToRerender(data)
                                    }}
                                />
                            )}
                            <Button
                                type="button"
                                icon={<FontAwesomeIcon icon={faTrash} />}
                                size="small"
                                severity="danger"
                                text
                                tooltip="Elimina documento"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setDocToDelete(data)
                                    setPermanent(false)
                                }}
                            />
                        </div>
                    )}
                />
            </DataTable>

            <Dialog
                header="Rigenera documento"
                visible={docToRerender !== null}
                style={{ width: "420px" }}
                onHide={() => setDocToRerender(null)}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button
                            label="Annulla"
                            icon="pi pi-times"
                            onClick={() => setDocToRerender(null)}
                            className="p-button-text"
                            disabled={isRerendering}
                        />
                        <Button
                            label="Rigenera"
                            icon="pi pi-refresh"
                            onClick={confirmRerender}
                            loading={isRerendering}
                        />
                    </div>
                }
            >
                <p className="m-0">
                    Il documento verrà rigenerato con i dati attuali e la
                    versione precedente verrà eliminata. Continuare?
                </p>
            </Dialog>

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
