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
import { useVetSearchQuery } from "../../queries"

import { classNames } from "primereact/utils"

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
            className="w-full p-inputtext-sm"
            placeholder="Cerca..."
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
            <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden">
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
                    emptyMessage="Nessun risultato trovato"
                    rowClassName={() =>
                        "cursor-pointer hover:bg-surface-50 transition-colors"
                    }
                    pt={{
                        header: {
                            className:
                                "bg-surface-50 border-b border-surface-200",
                        },
                        thead: { className: "bg-surface-50" },
                    }}
                >
                    <Column
                        field="business_name"
                        header="Denominazione"
                        filter
                        showFilterMatchModes={false}
                        filterElement={textFilterTemplate}
                        filterField="business_name"
                        body={(rowData) => (
                            <span className="font-medium text-surface-900">
                                {rowData.business_name}
                            </span>
                        )}
                    />
                    <Column
                        field="fiscal_code"
                        header="Codice Fiscale"
                        filter
                        showFilterMatchModes={false}
                        filterElement={textFilterTemplate}
                        filterField="fiscal_code"
                        className="font-mono text-sm"
                    />
                    <Column
                        field="phone"
                        header="Telefono"
                        filter
                        showFilterMatchModes={false}
                        filterElement={textFilterTemplate}
                        filterField="phone"
                    />
                    <Column
                        field="city"
                        header="Città"
                        filter
                        showFilterMatchModes={false}
                        filterElement={textFilterTemplate}
                        filterField="city"
                    />
                </DataTable>
            </div>
        </div>
    )
}

export default VetList
