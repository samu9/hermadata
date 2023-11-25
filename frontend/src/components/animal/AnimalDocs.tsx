import { faFilePdf } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { format } from "date-fns"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { useParams } from "react-router-dom"

const AnimalDocs = () => {
    const { code } = useParams()

    return (
        <div>
            <DataTable
                selectionMode="single"
                value={[
                    {
                        id: 1,
                        name: "Intervento recupero",
                        date: new Date("2023-11-11"),
                    },
                ]}
                showHeaders={false}
                dataKey="id"
            >
                <Column field="name" style={{ width: "100%" }} />
                <Column body={(data) => format(data.date, "dd/MM/y")} />
                <Column body={() => <FontAwesomeIcon icon={faFilePdf} />} />
            </DataTable>
        </div>
    )
}

export default AnimalDocs
