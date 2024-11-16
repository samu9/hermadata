import { Column, ColumnFilterElementTemplateOptions } from "primereact/column"
import {
    DataTable,
    DataTableFilterMeta,
    DataTableSortEvent,
    DataTableStateEvent,
    SortOrder,
} from "primereact/datatable"
import { InputText } from "primereact/inputtext"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AdopterSearch } from "../../models/adopter.schema"
import { useAdopterSearchQuery, useVetSearchQuery } from "../../queries"

type LazyTableState = {
    first: number
    rows: number
    page?: number | undefined
    sortField?: string
    sortOrder?: number | null
    filters: DataTableFilterMeta
}

const VetList = () => {
    const [totalRecords, setTotalRecords] = useState(0)

    const [lazyState, setLazyState] = useState<LazyTableState>({
        first: 0,
        rows: 10,
        page: 1,
        filters: {},
    })
    const [queryData, setQueryData] = useState<AdopterSearch>({
        from_index: lazyState.first,
        to_index: lazyState.first + lazyState.rows,
    })
    const vetQuery = useVetSearchQuery(queryData)

    useEffect(() => {
        vetQuery.data && setTotalRecords(vetQuery.data.total)
    }, [vetQuery.data])
    const navigate = useNavigate()

    const textFilterTemplate = (
        templateOptions: ColumnFilterElementTemplateOptions
    ) => (
        <InputText
            value={templateOptions.value || ""}
            type="text"
            onChange={(e) => templateOptions.filterCallback(e.target.value)}
        />
    )
    const onFilter = (event: DataTableStateEvent) => {
        setLazyState(event)
    }
    const onSort = (event: DataTableSortEvent) => {
        setLazyState({ ...lazyState, ...event })
    }
    useEffect(() => {
        setQueryData({
            ...queryData,
            from_index: lazyState.first,
            to_index: lazyState.first + lazyState.rows,
            sort_field: lazyState.sortField,
            sort_order: lazyState.sortOrder,
        })
    }, [lazyState])
    return (
        <div className="w-full">
            <DataTable
                className="w-full"
                filters={lazyState.filters}
                value={vetQuery.data?.items}
                selectionMode="single"
                onSelectionChange={(e) => navigate(e.value.id.toString())}
                paginator
                first={lazyState.first}
                dataKey="fiscal_code"
                rows={lazyState.rows}
                rowsPerPageOptions={[5, 10, 25, 50]}
                onFilter={onFilter}
                onPage={setLazyState}
                onSort={onSort}
                sortField={lazyState.sortField}
                sortOrder={lazyState.sortOrder as SortOrder}
                totalRecords={totalRecords}
                lazy
                emptyMessage="Nessun risultato"
                // rowClassName={(rowData) => classNames({})}
            >
                <Column
                    field="name"
                    header="Nome"
                    filter
                    showFilterMatchModes={false}
                    filterElement={textFilterTemplate}
                    filterField="name"
                />
                <Column
                    field="surname"
                    header="Cognome"
                    filter
                    showFilterMatchModes={false}
                    filterElement={textFilterTemplate}
                    filterField="surname"
                />
                <Column
                    field="business_name"
                    header="Denominazione"
                    filter
                    showFilterMatchModes={false}
                    filterElement={textFilterTemplate}
                    filterField="business_name"
                />
                <Column
                    field="fiscal_code"
                    header="Codice Fiscale"
                    filter
                    showFilterMatchModes={false}
                    filterElement={textFilterTemplate}
                    filterField="fiscal_code"
                />
            </DataTable>
        </div>
    )
}

export default VetList
