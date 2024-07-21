import { IconDefinition, faCat, faDog } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { format } from "date-fns"
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
import { Dropdown } from "primereact/dropdown"
import { InputSwitch, InputSwitchChangeEvent } from "primereact/inputswitch"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    AnimalSearchQuery,
    AnimalSearchResult,
} from "../../models/animal.schema"
import {
    useAnimalSearchQuery,
    useEntryTypesQuery,
    useExitTypesQuery,
} from "../../queries"
import UncontrolledComuniDropdown from "../forms/uncontrolled/UncontrolledComuniDropdown"
import UncontrolledProvinceDropdown from "../forms/uncontrolled/UncontrolledProvinceDropdown"
import { classNames } from "primereact/utils"
import { InputText } from "primereact/inputtext"
import { useEntryTypesMap, useExitTypesMap } from "../../hooks/useMaps"
import UncontrolledRacesDropdown from "../forms/uncontrolled/UncontrolledRacesDropdown"

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

type SwitchFilterProps = {
    label: string
    checked: boolean
    onChange: (e: InputSwitchChangeEvent) => void
}

const SwitchFilter = (props: SwitchFilterProps) => {
    return (
        <div className="inline-flex text-xs text-slate-600 items-center gap-2 py-1 pl-3 pr-1  border border-slate-200 rounded-full">
            <label htmlFor="present">{props.label}</label>
            <InputSwitch
                id="present"
                checked={props.checked}
                onChange={props.onChange}
            />
        </div>
    )
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
            race_id: {
                matchMode: FilterMatchMode.EQUALS,
                value: null,
            },
            chip_code: {
                matchMode: FilterMatchMode.EQUALS,
                value: null,
            },
            name: {
                matchMode: FilterMatchMode.EQUALS,
                value: null,
            },
            comune: {
                matchMode: FilterMatchMode.EQUALS,
                value: null,
            },
            entry_type: {
                matchMode: FilterMatchMode.EQUALS,
                value: null,
            },
            exit_type: {
                matchMode: FilterMatchMode.EQUALS,
                value: null,
            },
        },
    })
    const [queryData, setQueryData] = useState<AnimalSearchQuery>({
        from_index: lazyState.first,
        to_index: lazyState.first + lazyState.rows,
        present: true,
        not_present: false,
    })
    const animalQuery = useAnimalSearchQuery(queryData)
    const entryTypesQuery = useEntryTypesQuery()
    const exitTypesQuery = useExitTypesQuery()
    const entryTypesMap = useEntryTypesMap()
    const exitTypesMap = useExitTypesMap()

    useEffect(() => {
        animalQuery.data && setTotalRecords(animalQuery.data.total)
    }, [animalQuery.data])
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

    const raceFilterTemplate = (
        options: ColumnFilterElementTemplateOptions
    ) => {
        return (
            <div>
                <UncontrolledRacesDropdown
                    value={options.value}
                    onChange={(value) => options.filterCallback(value)}
                />
            </div>
        )
    }
    const selectFilterTemplate = (
        options: { id: string; label: string }[],
        templateOptions: ColumnFilterElementTemplateOptions
    ) => {
        return (
            <Dropdown
                options={options}
                optionLabel="label"
                optionValue="id"
                value={templateOptions.value}
                onChange={(e) => templateOptions.filterCallback(e.value)}
            />
        )
    }

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
            rescue_city_code: (
                lazyState.filters["comune"] as DataTableFilterMetaData
            ).value,
            entry_type: (
                lazyState.filters["entry_type"] as DataTableFilterMetaData
            ).value,
            exit_type: (
                lazyState.filters["exit_type"] as DataTableFilterMetaData
            ).value,
            chip_code: (
                lazyState.filters["chip_code"] as DataTableFilterMetaData
            ).value,
            name: (lazyState.filters["name"] as DataTableFilterMetaData).value,
            race_id: (lazyState.filters["race_id"] as DataTableFilterMetaData)
                .value,
        })
    }, [lazyState])
    return (
        <div className="w-full">
            <div className="py-2 flex gap-2">
                <SwitchFilter
                    label="Mostra presenti"
                    checked={queryData.present || false}
                    onChange={(e) =>
                        setQueryData({ ...queryData, present: e.value })
                    }
                />

                <SwitchFilter
                    label="Mostra non presenti"
                    checked={queryData.not_present || false}
                    onChange={(e) =>
                        setQueryData({ ...queryData, not_present: e.value })
                    }
                />
            </div>

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
                onSort={onSort}
                sortField={lazyState.sortField}
                sortOrder={lazyState.sortOrder as SortOrder}
                totalRecords={totalRecords}
                lazy
                rowClassName={(rowData) =>
                    classNames({
                        "bg-slate-100":
                            rowData.exit_date && rowData.exit_date < new Date(),
                    })
                }
            >
                <Column
                    header="Tipo"
                    body={(animal: AnimalSearchResult) => (
                        <FontAwesomeIcon
                            className="text-lg  "
                            icon={RACE_ICON_MAP[animal.race_id]}
                        />
                    )}
                    filter
                    filterElement={raceFilterTemplate}
                    showFilterMatchModes={false}
                    filterField="race_id"
                />
                <Column
                    field="name"
                    header="Nome"
                    filter
                    showFilterMatchModes={false}
                    filterElement={textFilterTemplate}
                    filterField="name"
                />
                <Column
                    filter
                    showFilterMatchModes={false}
                    filterElement={textFilterTemplate}
                    filterField="chip_code"
                    field="chip_code"
                    header="Chip"
                />
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
                    sortable
                    sortField="entry_city"
                />
                <Column
                    body={(animal: AnimalSearchResult) =>
                        animal.entry_date &&
                        format(animal.entry_date, "dd/MM/y")
                    }
                    sortable
                    sortField="entry_date"
                    header="Data ingresso"
                />
                <Column
                    filter
                    showFilterMatchModes={false}
                    filterElement={(templateOptions) =>
                        selectFilterTemplate(
                            entryTypesQuery.data || [],
                            templateOptions
                        )
                    }
                    filterField="entry_type"
                    body={(animal: AnimalSearchResult) => (
                        <span className="rounded-full text-xs py-1 bg-slate-600 text-white px-2">
                            {entryTypesMap?.[animal.entry_type]}
                        </span>
                    )}
                    header="Tipo ingresso"
                    className="text-center"
                />

                {queryData.not_present && (
                    <Column
                        body={(animal: AnimalSearchResult) =>
                            animal.exit_date &&
                            format(animal.exit_date, "dd/MM/y")
                        }
                        header="Data uscita"
                    />
                )}
                {queryData.not_present && (
                    <Column
                        filter
                        showFilterMatchModes={false}
                        filterElement={(templateOptions) =>
                            selectFilterTemplate(
                                exitTypesQuery.data || [],
                                templateOptions
                            )
                        }
                        filterField="exit_type"
                        body={(animal: AnimalSearchResult) =>
                            animal.exit_type && (
                                <span className="rounded-full text-xs py-1 bg-slate-600 text-white px-2">
                                    {exitTypesMap?.[animal.exit_type]}
                                </span>
                            )
                        }
                        header="Tipo uscita"
                        className="text-center"
                    />
                )}
                <Column header="Stato" />
            </DataTable>
        </div>
    )
}

export default AnimalList
