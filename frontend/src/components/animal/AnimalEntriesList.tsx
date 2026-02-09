import { useState } from "react"
import { Button } from "primereact/button"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { AnimalEntry } from "../../models/animal.schema"
import UpdateAnimalEntryDialog from "./UpdateAnimalEntryDialog"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit } from "@fortawesome/free-solid-svg-icons"
import {
    useAnimalEntriesQuery,
    useEntryTypesQuery,
    useExitTypesQuery,
} from "../../queries"

type Props = {
    animalId: string
}

const AnimalEntriesList = ({ animalId }: Props) => {
    const [selectedEntry, setSelectedEntry] = useState<AnimalEntry | null>(null)
    const [dialogVisible, setDialogVisible] = useState(false)

    // Use the dedicated queries
    const entriesQuery = useAnimalEntriesQuery(animalId)
    const entryTypesQuery = useEntryTypesQuery()
    const exitTypesQuery = useExitTypesQuery()

    const entries = entriesQuery.data || []

    const handleEditEntry = (entry: AnimalEntry) => {
        setSelectedEntry(entry)
        setDialogVisible(true)
    }

    const handleDialogHide = () => {
        setDialogVisible(false)
        setSelectedEntry(null)
    }

    const actionsTemplate = (entry: AnimalEntry) => {
        return (
            <Button
                type="button"
                icon={<FontAwesomeIcon icon={faEdit} />}
                size="small"
                severity="secondary"
                outlined
                tooltip="Modifica ingresso/uscita"
                onClick={() => handleEditEntry(entry)}
                className="p-button-sm"
            />
        )
    }

    const dateTemplate = (date: string | null) => {
        if (!date) return "-"
        return new Date(date).toLocaleDateString("it-IT")
    }

    const entryDateTemplate = (entry: AnimalEntry) =>
        dateTemplate(entry.entry_date)
    const exitDateTemplate = (entry: AnimalEntry) =>
        dateTemplate(entry.exit_date ?? null)

    // Template functions to map type codes to labels
    const entryTypeTemplate = (entry: AnimalEntry) => {
        const entryTypes = entryTypesQuery.data || []
        const type = entryTypes.find((t) => t.id === entry.entry_type)
        return type ? type.label : entry.entry_type || "-"
    }

    const exitTypeTemplate = (entry: AnimalEntry) => {
        const exitTypes = exitTypesQuery.data || []
        const type = exitTypes.find((t) => t.id === entry.exit_type)
        return type ? type.label : entry.exit_type || "-"
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Storico Ingressi/Uscite</h3>

            {entriesQuery.isLoading ? (
                <div className="text-center py-8">
                    <i className="pi pi-spinner pi-spin text-2xl"></i>
                    <p className="mt-2">Caricamento ingressi...</p>
                </div>
            ) : entriesQuery.error ? (
                <div className="text-center py-8 text-red-500">
                    <i className="pi pi-exclamation-triangle text-2xl"></i>
                    <p className="mt-2">
                        Errore nel caricamento degli ingressi
                    </p>
                </div>
            ) : (
                <DataTable
                    value={entries}
                    paginator
                    rows={10}
                    className="p-datatable-sm"
                    emptyMessage="Nessun ingresso trovato"
                >
                    <Column
                        field="entry_date"
                        header="Data Ingresso"
                        body={entryDateTemplate}
                        sortable
                    />
                    <Column
                        field="entry_type"
                        header="Tipo Ingresso"
                        body={entryTypeTemplate}
                        sortable
                    />
                    <Column
                        field="exit_date"
                        header="Data Uscita"
                        body={exitDateTemplate}
                        sortable
                    />
                    <Column
                        field="exit_type"
                        header="Tipo Uscita"
                        body={exitTypeTemplate}
                        sortable
                    />
                    <Column
                        header="Senza chip"
                        body={(entry: AnimalEntry) =>
                            entry.without_chip ? "Sì" : "No"
                        }
                    />
                    <Column
                        field="entry_notes"
                        header="Note Ingresso"
                        style={{ maxWidth: "200px" }}
                        className="text-sm"
                    />
                    <Column
                        field="exit_notes"
                        header="Note Uscita"
                        style={{ maxWidth: "200px" }}
                        className="text-sm"
                    />
                    <Column
                        header="Azioni"
                        body={actionsTemplate}
                        style={{ width: "80px" }}
                    />
                </DataTable>
            )}

            <UpdateAnimalEntryDialog
                visible={dialogVisible}
                onHide={handleDialogHide}
                animalId={animalId}
                entry={selectedEntry}
            />
        </div>
    )
}

export default AnimalEntriesList
