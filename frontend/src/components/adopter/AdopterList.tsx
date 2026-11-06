import { FilterMatchMode } from "primereact/api"
import { Column, ColumnFilterElementTemplateOptions } from "primereact/column"
import {
    DataTable,
    DataTableFilterMeta,
    DataTableFilterMetaData,
    DataTableSortEvent,
    DataTableStateEvent,
    SortOrder,
} from "primereact/datatable"
import { InputText } from "primereact/inputtext"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AdopterSearch } from "../../models/adopter.schema"
import { useAdopterSearchQuery } from "../../queries"
import { useSessionStorage } from "../../hooks/useSessionStorage"

type LazyTableState = {
    first: number
    rows: number
    page?: number | undefined
    sortField?: string
    sortOrder?: number | null
    filters: DataTableFilterMeta
}

const INITIAL_FILTERS: DataTableFilterMeta = {
    name: { matchMode: FilterMatchMode.STARTS_WITH, value: null },
    surname: { matchMode: FilterMatchMode.STARTS_WITH, value: null },
    fiscal_code: { matchMode: FilterMatchMode.STARTS_WITH, value: null },
    phone: { matchMode: FilterMatchMode.STARTS_WITH, value: null },
    city: { matchMode: FilterMatchMode.STARTS_WITH, value: null },
}

const AdopterList = () => {
    const [totalRecords, setTotalRecords] = useState(0)

    const [lazyState, setLazyState] = useSessionStorage<LazyTableState>(
        "adopter-list:lazy-state",
        {
            first: 0,
            rows: 10,
            page: 1,
            filters: INITIAL_FILTERS,
        },
    )

    const [queryData, setQueryData] = useSessionStorage<AdopterSearch>(
        "adopter-list:query-data",
        {
            from_index: 0,
            to_index: 10,
        },
    )

    const adopterQuery = useAdopterSearchQuery(queryData)

    const hasActiveFilters = Object.values(lazyState.filters).some(
        (f) => (f as DataTableFilterMetaData).value !== null,
    )

    const resetFilters = () => {
        setLazyState((prev) => ({ ...prev, filters: INITIAL_FILTERS }))
    }

    useEffect(() => {
        adopterQuery.data && setTotalRecords(adopterQuery.data.total)
    }, [adopterQuery.data])

    const navigate = useNavigate()

    const textFilterTemplate = (
        templateOptions: ColumnFilterElementTemplateOptions,
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
            name: (lazyState.filters["name"] as DataTableFilterMetaData)?.value,
            surname: (lazyState.filters["surname"] as DataTableFilterMetaData)?.value,
            fiscal_code: (lazyState.filters["fiscal_code"] as DataTableFilterMetaData)?.value,
            phone: (lazyState.filters["phone"] as DataTableFilterMetaData)?.value,
            city: (lazyState.filters["city"] as DataTableFilterMetaData)?.value,
        })
    }, [lazyState])

    return (
        <div className="w-full space-y-4">
            {hasActiveFilters && (
                <div className="p-4 bg-white rounded-xl shadow-sm border border-surface-200 flex gap-3 items-center">
                    <button
                        onClick={resetFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-all"
                    >
                        <i className="pi pi-times text-xs" />
                        Azzera filtri
                    </button>
                </div>
            )}
            <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden">
                <DataTable
                    className="w-full"
                    scrollable
                    tableStyle={{ minWidth: "48rem" }}
                    filters={lazyState.filters}
                    value={adopterQuery.data?.items}
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
                    loading={adopterQuery.isLoading}
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
                        field="name"
                        header="Nome"
                        filter
                        showFilterMatchModes={false}
                        filterElement={textFilterTemplate}
                        filterField="name"
                        body={(rowData) => (
                            <span className="font-medium text-surface-900">
                                {rowData.name}
                            </span>
                        )}
                    />
                    <Column
                        field="surname"
                        header="Cognome"
                        filter
                        showFilterMatchModes={false}
                        filterElement={textFilterTemplate}
                        filterField="surname"
                        body={(rowData) => (
                            <span className="font-medium text-surface-900">
                                {rowData.surname}
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

export default AdopterList
