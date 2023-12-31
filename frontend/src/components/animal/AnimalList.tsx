import { useEffect, useState } from "react"
import { useQuery } from "react-query"
import { apiService } from "../../main"
import {
    DataTable,
    DataTableFilterMeta,
    DataTableFilterMetaData,
    DataTableStateEvent,
} from "primereact/datatable"
import { Column, ColumnFilterElementTemplateOptions } from "primereact/column"
import {
    AnimalSearchQuery,
    AnimalSearchResult,
} from "../../models/animal.schema"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"
import { FilterMatchMode } from "primereact/api"
import UncontrolledComuniDropdown from "../forms/uncontrolled/UncontrolledComuniDropdown"
import { useEntryTypesQuery } from "../../queries"
import { Dropdown } from "primereact/dropdown"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconDefinition, faCat, faDog } from "@fortawesome/free-solid-svg-icons"
import UncontrolledProvinceDropdown from "../forms/uncontrolled/UncontrolledProvinceDropdown"

type LazyTableState = {
    first: number
    rows: number
    page?: number | undefined
    sortField?: string
    sortOrder?: number | null
    filters: DataTableFilterMeta
}

const RACE_ICON_MAP: { [key: string]: IconDefinition } = {
    G: faCat,
    C: faDog,
}

const AnimalList = () => {
    const [totalRecords, setTotalRecords] = useState(0)
    const [provinciaProvenienzaFilter, setProvinciaProvenienzaFilter] =
        useState<string | undefined>(undefined)
    const [lazyState, setLazyState] = useState<LazyTableState>({
        first: 0,
        rows: 10,
        page: 1,
        filters: {
            comune: {
                matchMode: FilterMatchMode.EQUALS,
                value: null,
            },
            entry_type: {
                matchMode: FilterMatchMode.EQUALS,
                value: null,
            },
        },
    })
    const [queryData, setQueryData] = useState<AnimalSearchQuery>({
        from_index: lazyState.first,
        to_index: lazyState.first + lazyState.rows,
        entry_type: undefined,
        rescue_city_code: undefined,
    })
    const animalQuery = useQuery(["animal-search", queryData], {
        queryFn: () => apiService.searchAnimals(queryData),
        staleTime: Infinity,
        onSuccess: (data) => {
            setTotalRecords(data.total)
        },
    })
    const entryTypesQuery = useEntryTypesQuery()
    const entryTypesMap = entryTypesQuery.data?.reduce(
        (result: { [key: string]: string }, current) => {
            result[current.id] = current.label
            return result
        },
        {}
    )
    const navigate = useNavigate()

    const comuneFilterTemplate = (
        options: ColumnFilterElementTemplateOptions
    ) => {
        return (
            <div>
                <UncontrolledProvinceDropdown
                    value={provinciaProvenienzaFilter}
                    onChange={(value) => setProvinciaProvenienzaFilter(value)}
                />
                {provinciaProvenienzaFilter && (
                    <UncontrolledComuniDropdown
                        provincia={provinciaProvenienzaFilter}
                        value={options.value}
                        onChange={(value) => options.filterCallback(value)}
                    />
                )}
            </div>
        )
    }

    const entryTypeFilterTemplate = (
        options: ColumnFilterElementTemplateOptions
    ) => {
        return (
            <Dropdown
                options={entryTypesQuery.data}
                optionLabel="label"
                optionValue="id"
                value={options.value}
                onChange={(e) => options.filterCallback(e.value)}
            />
        )
    }
    const onFilter = (event: DataTableStateEvent) => {
        console.log(event)
        setLazyState(event)
    }
    useEffect(() => {
        setQueryData({
            from_index: lazyState.first,
            to_index: lazyState.first + lazyState.rows,
            rescue_city_code: (
                lazyState.filters["comune"] as DataTableFilterMetaData
            ).value,
            entry_type: (
                lazyState.filters["entry_type"] as DataTableFilterMetaData
            ).value,
        })
    }, [lazyState])
    return (
        <div className="w-full">
            <DataTable
                className="w-full"
                filters={lazyState.filters}
                value={animalQuery.data?.items}
                selectionMode="single"
                onSelectionChange={(e) => navigate(e.value.id.toString())}
                paginator
                first={lazyState.first}
                dataKey="code"
                rows={lazyState.rows}
                rowsPerPageOptions={[5, 10, 25, 50]}
                onFilter={onFilter}
                onPage={setLazyState}
                totalRecords={totalRecords}
                lazy
            >
                {/* <Column
                    body={(animal: AnimalSearchResult) => (
                        <img
                            className="rounded-full h-full"
                            src="https://www.bil-jac.com/Images/DogPlaceholder.svg"
                        />
                    )}
                /> */}
                <Column
                    body={(animal: AnimalSearchResult) => (
                        <FontAwesomeIcon
                            className="text-lg"
                            icon={RACE_ICON_MAP[animal.race_id]}
                        />
                    )}
                />
                {/* <Column field="code" header="Codice" /> */}
                <Column field="name" header="Nome" />
                <Column field="chip_code" header="Chip" />
                <Column
                    className="max-w-10 whitespace-nowrap"
                    filter
                    filterField="comune"
                    showFilterMatchModes={false}
                    filterElement={comuneFilterTemplate}
                    filterMatchMode={FilterMatchMode.EQUALS}
                    header="Provenienza"
                    field="comune"
                    onFilterClear={() =>
                        setProvinciaProvenienzaFilter(undefined)
                    }
                    showFilterMenuOptions={false}
                    showFilterOperator={false}
                    showAddButton={false}
                    body={(animal: AnimalSearchResult) =>
                        `${animal.rescue_city} (${animal.rescue_province})`
                    }
                />
                <Column
                    filter
                    showFilterMatchModes={false}
                    filterElement={entryTypeFilterTemplate}
                    filterField="entry_type"
                    body={(animal: AnimalSearchResult) => (
                        <span className="rounded-full text-xs py-1 bg-slate-600 text-white px-2">
                            {entryTypesMap?.[animal.entry_type]}
                        </span>
                    )}
                    header="Tipo ingresso"
                />
                <Column
                    body={(animal: AnimalSearchResult) =>
                        animal.entry_date &&
                        format(animal.entry_date, "dd/MM/y")
                    }
                    header="Data ingresso"
                />
            </DataTable>
        </div>
    )
}

export default AnimalList
