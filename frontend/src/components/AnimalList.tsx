import { useState } from "react"
import { useQuery } from "react-query"
import { apiService } from "../main"
import { DataTable, DataTableStateEvent } from "primereact/datatable"
import { Column } from "primereact/column"
import { AnimalSearchResult } from "../models/animal.schema"
import { format } from "date-fns"

const AnimalList = () => {
    const [page, setPage] = useState(0)
    const [perPage, setPerPage] = useState(1)
    const [first, setFirst] = useState(0)
    const [total, setTotal] = useState(0)
    const animalQuery = useQuery(
        ["animal-search", first, first + perPage],
        () =>
            apiService.searchAnimals({
                from_index: first,
                to_index: first + perPage,
            }),
        {
            onSuccess: (data) => {
                console.log(data.items)
                setTotal(data.total)
            },
        }
    )
    return (
        <div>
            <DataTable
                value={animalQuery.data?.items}
                paginator
                first={first}
                dataKey="code"
                rows={perPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                onPage={(e: DataTableStateEvent) => {
                    setFirst(e.first)
                    setPerPage(e.rows)
                }}
                totalRecords={total}
            >
                <Column
                    body={(animal: AnimalSearchResult) => (
                        <img
                            className="rounded-full h-full"
                            src="https://www.bil-jac.com/Images/DogPlaceholder.svg"
                        />
                    )}
                />
                <Column field="race_id" header="Tipo" />
                <Column field="code" header="Codice" />
                <Column field="name" header="Nome" />
                <Column
                    body={(animal: AnimalSearchResult) =>
                        format(animal.rescue_date, "dd/MM/y")
                    }
                    header="Data ingresso"
                />
                <Column
                    header="Provenienza"
                    body={(animal: AnimalSearchResult) =>
                        `${animal.rescue_city} (${animal.rescue_province})`
                    }
                />
            </DataTable>
        </div>
    )
}

export default AnimalList
