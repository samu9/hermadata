import { faFile, faFilePdf } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { format } from "date-fns"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useToolbar } from "../../contexts/Toolbar"
import { apiService } from "../../main"
import { DocKind } from "../../models/docs.schema"
import { useAnimalDocumentsQuery, useDocKindsQuery } from "../../queries"
import AnimalDocUploadForm from "./AnimalDocUploadForm"

const AnimalDocs = () => {
    const { id } = useParams()

    const docKindsQuery = useDocKindsQuery()

    const docKindsMap =
        docKindsQuery.data?.reduce(
            (result: { [key: string]: string }, current: DocKind) => {
                result[current.code] = current.name
                return result
            },
            {}
        ) || {}

    const animalDocumentsQuery = useAnimalDocumentsQuery(parseInt(id!))
    const { addButton, removeButton } = useToolbar()

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
    return (
        <div>
            <DataTable
                emptyMessage="Nessun documento trovato"
                selectionMode="single"
                onSelectionChange={(e) => apiService.openDocument(e.value.id)}
                value={
                    animalDocumentsQuery.data?.map((d) => ({
                        id: d.document_id,
                        kind: docKindsMap[d.document_kind_code],
                        created_at: d.created_at,
                    })) || []
                }
                showHeaders={false}
                dataKey="id"
            >
                <Column field="kind" style={{ width: "100%" }} />
                <Column body={(data) => format(data.created_at, "dd/MM/y")} />
                <Column body={() => <FontAwesomeIcon icon={faFilePdf} />} />
            </DataTable>
        </div>
    )
}

export default AnimalDocs
