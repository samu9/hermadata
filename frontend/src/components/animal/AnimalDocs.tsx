import { faFilePdf } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { format } from "date-fns"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { useParams } from "react-router-dom"
import { useAnimalDocumentsQuery, useDocKindsQuery } from "../../queries"
import { DocKind } from "../../models/docs.schema"
import { apiService } from "../../main"
import NewAnimalDocument from "../new-animal-document/NewDocument"

const AnimalDocs = () => {
    const { id } = useParams()

    const docKindsQuery = useDocKindsQuery()

    const docKindsMap =
        docKindsQuery.data?.reduce(
            (result: { [key: number]: string }, current: DocKind) => {
                result[current.id] = current.name
                return result
            },
            {}
        ) || {}

    const animalDocumentsQuery = useAnimalDocumentsQuery(parseInt(id!))

    return (
        <div>
            <DataTable
                selectionMode="single"
                onSelectionChange={(e) => apiService.openDocument(e.value.id)}
                value={
                    animalDocumentsQuery.data?.map((d) => ({
                        id: d.document_id,
                        kind: docKindsMap[d.document_kind_id],
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

            <NewAnimalDocument />
        </div>
    )
}

export default AnimalDocs
