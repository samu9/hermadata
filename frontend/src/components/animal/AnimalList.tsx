import {
    IconDefinition,
    faCat,
    faDog,
    faHospital,
    faHome,
} from "@fortawesome/free-solid-svg-icons"
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
import { useAuth } from "../../contexts/AuthContext"
import { Permission } from "../../constants"
import { Tooltip } from "primereact/tooltip"

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
        <div
            className={classNames(
                "inline-flex text-sm items-center gap-3 px-4 py-2 rounded-full transition-all border",
                {
                    "bg-primary-50 border-primary-200 text-primary-700":
                        props.checked,
                    "bg-surface-0 border-surface-200 text-surface-600 hover:bg-surface-50":
                        !props.checked,
                },
            )}
        >
            <label
                htmlFor={props.label}
                className="font-medium cursor-pointer select-none"
            >
                {props.label}
            </label>
            <InputSwitch
                id={props.label}
                checked={props.checked}
                onChange={props.onChange}
                className="scale-75"
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
    const { can } = useAuth()
    const canBrowseNotPresentOnly =
        can(Permission.BROWSE_NOT_PRESENT_ANIMALS) &&
        !can(Permission.BROWSE_PRESENT_ANIMALS)

    const [queryData, setQueryData] = useState<AnimalSearchQuery>({
        from_index: lazyState.first,
        to_index: lazyState.first + lazyState.rows,
        present: canBrowseNotPresentOnly ? false : true,
        not_present: canBrowseNotPresentOnly ? true : false,
        healthcare_stage: true,
        shelter_stage: true,
        cats: true,
        dogs: true,
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
        options: ColumnFilterElementTemplateOptions,
    ) => {
        return (
            <div className="flex flex-col gap-2 p-2">
                <UncontrolledProvinceDropdown
                    value={provinciaProvenienzaFilter}
                    onChange={(value) => setProvinciaProvenienzaFilter(value)}
                    className="w-full"
                />
                {provinciaProvenienzaFilter && (
                    <UncontrolledComuniDropdown
                        provincia={provinciaProvenienzaFilter}
                        value={options.value}
                        onChange={(value) => options.filterCallback(value)}
                        className="w-full"
                    />
                )}
            </div>
        )
    }

    const raceFilterTemplate = (
        options: ColumnFilterElementTemplateOptions,
    ) => {
        return (
            <div className="p-2">
                <UncontrolledRacesDropdown
                    value={options.value}
                    onChange={(value) => options.filterCallback(value)}
                    className="w-full"
                />
            </div>
        )
    }
    const selectFilterTemplate = (
        options: { id: string; label: string }[],
        templateOptions: ColumnFilterElementTemplateOptions,
    ) => {
        return (
            <Dropdown
                options={options}
                optionLabel="label"
                optionValue="id"
                value={templateOptions.value}
                onChange={(e) => templateOptions.filterCallback(e.value)}
                className="w-full"
                placeholder="Seleziona..."
            />
        )
    }

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
        <div className="w-full space-y-4">
            <div className="p-4 bg-white rounded-xl shadow-sm border border-surface-200 flex gap-3 flex-wrap items-center">
                {can(Permission.BROWSE_PRESENT_ANIMALS) &&
                    can(Permission.BROWSE_NOT_PRESENT_ANIMALS) && (
                        <>
                            <SwitchFilter
                                label="Presenti"
                                checked={queryData.present || false}
                                onChange={(e) => {
                                    // If trying to disable presenti while non_presenti is already disabled,
                                    // enable non_presenti instead
                                    if (!e.value && !queryData.not_present) {
                                        setQueryData({
                                            ...queryData,
                                            present: false,
                                            not_present: true,
                                        })
                                    } else {
                                        setQueryData({
                                            ...queryData,
                                            present: e.value,
                                        })
                                    }
                                }}
                            />

                            <SwitchFilter
                                label="Non presenti"
                                checked={queryData.not_present || false}
                                onChange={(e) => {
                                    if (!e.value && !queryData.present) {
                                        setQueryData({
                                            ...queryData,
                                            not_present: false,
                                            present: true,
                                        })
                                    } else {
                                        setQueryData({
                                            ...queryData,
                                            not_present: e.value,
                                        })
                                    }
                                }}
                            />
                            <div className="w-px h-8 bg-surface-200 mx-1"></div>
                        </>
                    )}
                <SwitchFilter
                    label="Sanitario"
                    checked={queryData.healthcare_stage || false}
                    onChange={(e) => {
                        if (!e.value && !queryData.shelter_stage) {
                            setQueryData({
                                ...queryData,
                                healthcare_stage: false,
                                shelter_stage: true,
                            })
                        } else {
                            setQueryData({
                                ...queryData,
                                healthcare_stage: e.value,
                            })
                        }
                    }}
                />
                <SwitchFilter
                    label="Rifugio"
                    checked={queryData.shelter_stage || false}
                    onChange={(e) => {
                        if (!e.value && !queryData.healthcare_stage) {
                            setQueryData({
                                ...queryData,
                                shelter_stage: false,
                                healthcare_stage: true,
                            })
                        } else {
                            setQueryData({
                                ...queryData,
                                shelter_stage: e.value,
                            })
                        }
                    }}
                />
                <div className="w-px h-8 bg-surface-200 mx-1"></div>
                <SwitchFilter
                    label="Cani"
                    checked={queryData.dogs || false}
                    onChange={(e) => {
                        if (!e.value && !queryData.cats) {
                            setQueryData({
                                ...queryData,
                                dogs: false,
                                cats: true,
                            })
                        } else {
                            setQueryData({
                                ...queryData,
                                dogs: e.value,
                            })
                        }
                    }}
                />
                <SwitchFilter
                    label="Gatti"
                    checked={queryData.cats || false}
                    onChange={(e) => {
                        if (!e.value && !queryData.dogs) {
                            setQueryData({
                                ...queryData,
                                cats: false,
                                dogs: true,
                            })
                        } else {
                            setQueryData({
                                ...queryData,
                                cats: e.value,
                            })
                        }
                    }}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden">
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
                    emptyMessage="Nessun risultato trovato"
                    rowClassName={(rowData) =>
                        classNames(
                            "cursor-pointer hover:bg-surface-50 transition-colors",
                            {
                                "bg-surface-50 text-surface-500":
                                    rowData.exit_date &&
                                    rowData.exit_date < new Date(),
                            },
                        )
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
                        header="Tipo"
                        body={(animal: AnimalSearchResult) => (
                            <div className="flex justify-center">
                                <FontAwesomeIcon
                                    className={classNames("text-lg", {
                                        "text-primary-600": !animal.exit_date,
                                        "text-surface-400": animal.exit_date,
                                    })}
                                    icon={RACE_ICON_MAP[animal.race_id]}
                                />
                            </div>
                        )}
                        filter
                        filterElement={raceFilterTemplate}
                        showFilterMatchModes={false}
                        filterField="race_id"
                        className="w-16 text-center"
                    />
                    <Column
                        field="name"
                        header="Nome"
                        filter
                        showFilterMatchModes={false}
                        filterElement={textFilterTemplate}
                        filterField="name"
                        body={(animal: AnimalSearchResult) => (
                            <span className="font-medium text-surface-900">
                                {animal.name}
                            </span>
                        )}
                    />
                    <Column
                        filter
                        showFilterMatchModes={false}
                        filterElement={textFilterTemplate}
                        filterField="chip_code"
                        field="chip_code"
                        header="Chip"
                        className="font-mono text-sm"
                        body={(animal: AnimalSearchResult) =>
                            animal.without_chip ? (
                                <span className="text-red-500 italic">
                                    Senza chip
                                </span>
                            ) : (
                                animal.chip_code
                            )
                        }
                    />
                    <Column
                        className="max-w-[200px]"
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
                                templateOptions,
                            )
                        }
                        filterField="entry_type"
                        body={(animal: AnimalSearchResult) => (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-100 text-surface-800">
                                {entryTypesMap?.[animal.entry_type]}
                            </span>
                        )}
                        header="Tipo ingresso"
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
                                    templateOptions,
                                )
                            }
                            filterField="exit_type"
                            body={(animal: AnimalSearchResult) =>
                                animal.exit_type && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-100 text-surface-800">
                                        {exitTypesMap?.[animal.exit_type]}
                                    </span>
                                )
                            }
                            header="Tipo uscita"
                        />
                    )}
                    <Column
                        header="Stato"
                        body={(animal: AnimalSearchResult) => (
                            <div className="flex justify-center">
                                <Tooltip target={`.stato-icon-${animal.id}`} />
                                <FontAwesomeIcon
                                    className={`stato-icon-${
                                        animal.id
                                    } text-lg ${
                                        animal.healthcare_stage
                                            ? "text-red-500"
                                            : "text-green-500"
                                    }`}
                                    icon={
                                        animal.healthcare_stage
                                            ? faHospital
                                            : faHome
                                    }
                                    data-pr-tooltip={
                                        animal.healthcare_stage
                                            ? "Sanitario"
                                            : "Rifugio"
                                    }
                                    data-pr-position="top"
                                />
                            </div>
                        )}
                        className="w-16 text-center"
                    />
                </DataTable>
            </div>
        </div>
    )
}

export default AnimalList
