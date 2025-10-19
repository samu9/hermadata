import { useState } from "react"
import { Button } from "primereact/button"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { AnimalEntry } from "../../models/animal.schema"
import UpdateAnimalEntryDialog from "./UpdateAnimalEntryDialog"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit } from "@fortawesome/free-solid-svg-icons"
import { useAnimalEntriesQuery } from "../../queries"

type Props = {
    animalId: string
}

const AnimalEntriesList = ({ animalId }: Props) => {
    const [selectedEntry, setSelectedEntry] = useState<AnimalEntry | null>(null)
    const [dialogVisible, setDialogVisible] = useState(false)
    
    // Use the dedicated query for animal entries
    const entriesQuery = useAnimalEntriesQuery(animalId)
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
                    <p className="mt-2">Errore nel caricamento degli ingressi</p>
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
                <Column field="entry_type" header="Tipo Ingresso" sortable />
                <Column
                    field="exit_date"
                    header="Data Uscita"
                    body={exitDateTemplate}
                    sortable
                />
                <Column field="exit_type" header="Tipo Uscita" sortable />
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
