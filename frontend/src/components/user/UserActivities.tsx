import React, { useState } from "react"
import { DataTable, DataTablePageEvent } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { Dropdown } from "primereact/dropdown"
import { Calendar } from "primereact/calendar"
import { useQuery } from "react-query"
import { apiService } from "../../main"
import { Activity, ActivityFilterQuery } from "../../models/activity.schema"
import { format } from "date-fns"
import { ManagementUser } from "../../models/user.schema"

const UserActivities: React.FC = () => {
    // State for pagination
    const [first, setFirst] = useState(0)
    const [rows, setRows] = useState(15)

    // State for filters
    const [selectedUser, setSelectedUser] = useState<ManagementUser | null>(
        null,
    )
    const [dateRange, setDateRange] = useState<(Date | null)[] | null>(null)

    // Prepare query filters
    const queryFilters: ActivityFilterQuery = {
        from_index: first,
        to_index: first + rows - 1,
        user_id: selectedUser?.id,
        start_date:
            dateRange && dateRange[0]
                ? format(dateRange[0], "yyyy-MM-dd")
                : undefined,
        end_date:
            dateRange && dateRange[1]
                ? format(dateRange[1], "yyyy-MM-dd")
                : undefined,
        sort_field: "created_at",
        sort_order: -1,
    }

    // Fetch activities
    const activitiesQuery = useQuery(
        ["user-activities", queryFilters],
        () => apiService.getUserActivities(queryFilters),
        {
            keepPreviousData: true,
            staleTime: 5000,
        },
    )

    // Fetch users for filter dropdown
    const usersQuery = useQuery(
        "users-list-filter",
        () => apiService.getAllUsers({ from_index: 0, to_index: 1000 }),
        {
            staleTime: 60000,
        },
    )

    const onPage = (event: DataTablePageEvent) => {
        setFirst(event.first)
        setRows(event.rows)
    }

    const resetFilters = () => {
        setSelectedUser(null)
        setDateRange(null)
        setFirst(0)
    }

    // Templates
    const dateBodyTemplate = (rowData: Activity) => {
        const date = new Date(rowData.created_at)
        return (
            <div className="flex flex-col">
                <span className="font-medium">
                    {date.toLocaleDateString("it-IT")}
                </span>
                <span className="text-sm text-surface-500">
                    {date.toLocaleTimeString("it-IT", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </span>
            </div>
        )
    }

    const userBodyTemplate = (rowData: Activity) => {
        return (
            <div className="flex flex-col">
                <span className="font-medium">
                    {rowData.user_name || "Sistema / Sconosciuto"}
                </span>
                <span className="text-xs text-surface-500">
                    ID: {rowData.user_id || "-"}
                </span>
            </div>
        )
    }

    const descriptionBodyTemplate = (rowData: Activity) => {
        return (
            <div className="flex flex-col gap-1">
                <span className="font-medium">
                    {rowData.event_description || "Attività generica"}
                </span>
                {rowData.data && (
                    <div className="text-xs bg-surface-50 p-1 rounded border border-surface-200 font-mono text-surface-600 truncate max-w-xs">
                        {JSON.stringify(rowData.data)}
                    </div>
                )}
            </div>
        )
    }

    const dataBodyTemplate = (rowData: Activity) => {
        if (!rowData.data) return <span className="text-surface-400">-</span>
        return (
            <Button
                icon="pi pi-code"
                className="p-button-text p-button-sm !w-8 !h-8"
                tooltip={JSON.stringify(rowData.data, null, 2)}
                tooltipOptions={{ showDelay: 300, className: "max-w-md" }}
                onClick={() => {
                    // Could open a dialog with full JSON
                    console.log(rowData.data)
                }}
            />
        )
    }

    return (
        <div className="space-y-4">
            {/* Filters Section */}
            <div className="flex flex-wrap items-end gap-4 p-4 bg-surface-50 rounded-lg border border-surface-200">
                <div className="flex flex-col gap-2 flex-grow md:flex-grow-0 md:w-64">
                    <label
                        htmlFor="user-filter"
                        className="text-sm font-medium text-surface-700"
                    >
                        Utente
                    </label>
                    <Dropdown
                        id="user-filter"
                        value={selectedUser}
                        onChange={(e) => {
                            setSelectedUser(e.value)
                            setFirst(0)
                        }}
                        options={usersQuery.data?.items || []}
                        optionLabel="email"
                        itemTemplate={(option: ManagementUser) => (
                            <div>
                                {option.name && option.surname
                                    ? `${option.name} ${option.surname} (${option.email})`
                                    : option.email}
                            </div>
                        )}
                        valueTemplate={(option: ManagementUser) => {
                            if (!option) return "Tutti gli utenti"
                            return option.name && option.surname
                                ? `${option.name} ${option.surname}`
                                : option.email
                        }}
                        placeholder="Seleziona un utente"
                        className="w-full"
                        showClear
                        filter
                    />
                </div>

                <div className="flex flex-col gap-2 flex-grow md:flex-grow-0 md:w-64">
                    <label
                        htmlFor="date-range"
                        className="text-sm font-medium text-surface-700"
                    >
                        Periodo
                    </label>
                    <Calendar
                        id="date-range"
                        value={dateRange}
                        onChange={(e) => {
                            setDateRange(e.value as (Date | null)[])
                            setFirst(0)
                        }}
                        selectionMode="range"
                        readOnlyInput
                        showIcon
                        placeholder="Intervallo date"
                        dateFormat="dd/mm/yy"
                        className="w-full"
                    />
                </div>

                <div className="flex gap-2 ml-auto">
                    <Button
                        label="Reset Filtri"
                        icon="pi pi-filter-slash"
                        className="p-button-outlined p-button-secondary"
                        onClick={resetFilters}
                        disabled={!selectedUser && !dateRange}
                    />
                    <Button
                        icon="pi pi-refresh"
                        className="!bg-white !text-surface-700 !border-surface-300 hover:!bg-surface-50"
                        onClick={() => activitiesQuery.refetch()}
                        loading={activitiesQuery.isRefetching}
                        tooltip="Aggiorna lista"
                    />
                </div>
            </div>

            {/* Error Message */}
            {activitiesQuery.isError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                    <i className="pi pi-exclamation-triangle mr-2"></i>
                    Si è verificato un errore nel caricamento delle attività.
                    Riprova più tardi.
                </div>
            )}

            {/* Data Table */}
            <DataTable
                value={activitiesQuery.data?.items || []}
                paginator
                lazy
                first={first}
                rows={rows}
                totalRecords={activitiesQuery.data?.total || 0}
                onPage={onPage}
                rowsPerPageOptions={[10, 15, 25, 50, 100]}
                loading={activitiesQuery.isLoading}
                emptyMessage="Nessuna attività trovata con i filtri selezionati"
                className="p-datatable-sm"
                pt={{
                    headerRow: { className: "bg-surface-50 text-surface-700" },
                }}
            >
                <Column
                    field="created_at"
                    header="Data"
                    body={dateBodyTemplate}
                    style={{ width: "15%" }}
                />
                <Column
                    header="Utente"
                    body={userBodyTemplate}
                    style={{ width: "20%" }}
                />
                <Column
                    header="Descrizione Evento"
                    body={descriptionBodyTemplate}
                    style={{ width: "55%" }}
                />
                <Column
                    header="Dati"
                    body={dataBodyTemplate}
                    style={{ width: "10%", textAlign: "center" }}
                />
            </DataTable>

            {/* Summary Footer */}
            <div className="text-sm text-surface-500 text-right">
                Totale attività: {activitiesQuery.data?.total || 0}
            </div>
        </div>
    )
}

export default UserActivities
