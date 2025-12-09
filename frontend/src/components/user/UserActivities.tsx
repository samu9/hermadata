import React from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Tag } from "primereact/tag"
import { Button } from "primereact/button"
import { useQuery } from "react-query"
import { apiService } from "../../main"
import { UserActivity } from "../../models/user.schema"

const UserActivities: React.FC = () => {
    const activitiesQuery = useQuery(
        "user-activities",
        () => apiService.getUserActivities(),
        {
            staleTime: 30000, // 30 seconds
            refetchInterval: 60000, // Refresh every minute
        }
    )

    const actionBodyTemplate = (activity: UserActivity) => {
        const getSeverity = (
            action: string
        ): "success" | "info" | "warning" | "danger" => {
            switch (action.toLowerCase()) {
                case "login":
                    return "success"
                case "logout":
                    return "info"
                case "create":
                    return "info"
                case "update":
                    return "warning"
                case "delete":
                    return "danger"
                default:
                    return "info"
            }
        }

        return (
            <Tag
                value={activity.action}
                severity={getSeverity(activity.action)}
                className="text-sm"
            />
        )
    }

    const timestampBodyTemplate = (activity: UserActivity) => {
        const date = new Date(activity.timestamp)
        return (
            <div className="text-sm">
                <div>{date.toLocaleDateString("it-IT")}</div>
                <div className="text-gray-500">
                    {date.toLocaleTimeString("it-IT")}
                </div>
            </div>
        )
    }

    const userBodyTemplate = (activity: UserActivity) => {
        return (
            <div className="text-sm">
                <div className="font-medium">{activity.user_name}</div>
                <div className="text-gray-500">{activity.user_email}</div>
            </div>
        )
    }

    const descriptionBodyTemplate = (activity: UserActivity) => {
        return (
            <div className="text-sm max-w-md">
                <div className="truncate" title={activity.description}>
                    {activity.description}
                </div>
                {activity.ip_address && (
                    <div className="text-gray-500 text-xs mt-1">
                        IP: {activity.ip_address}
                    </div>
                )}
            </div>
        )
    }

    if (activitiesQuery.isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="text-center">
                    <i className="pi pi-spin pi-spinner text-2xl text-gray-400 mb-2"></i>
                    <div className="text-gray-600">Caricamento attività...</div>
                </div>
            </div>
        )
    }

    if (activitiesQuery.error) {
        return (
            <div className="text-center p-8">
                <div className="text-red-600 mb-2">
                    <i className="pi pi-exclamation-triangle text-2xl"></i>
                </div>
                <div className="text-red-600">
                    Errore nel caricamento delle attività
                </div>
                <Button
                    label="Riprova"
                    className="p-button-outlined mt-3"
                    onClick={() => activitiesQuery.refetch()}
                />
            </div>
        )
    }

    return (
        <div className="bg-white">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-surface-900">
                        Attività Recenti
                    </h2>
                    <p className="text-surface-600 text-sm mt-1">
                        Monitora le azioni degli utenti nel sistema
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        label="Aggiorna"
                        icon="pi pi-refresh"
                        className="!bg-white !text-surface-700 !border-surface-300 hover:!bg-surface-50"
                        onClick={() => activitiesQuery.refetch()}
                        loading={activitiesQuery.isRefetching}
                    />
                </div>
            </div>

            <DataTable
                value={activitiesQuery.data || []}
                paginator
                rows={15}
                rowsPerPageOptions={[10, 15, 25, 50]}
                className="p-datatable-sm"
                emptyMessage="Nessuna attività trovata"
                sortField="timestamp"
                sortOrder={-1}
                loading={activitiesQuery.isLoading}
                pt={{
                    headerRow: { className: "bg-surface-50 text-surface-700" },
                    thead: { className: "bg-surface-50" },
                }}
            >
                <Column
                    field="timestamp"
                    header="Data/Ora"
                    body={timestampBodyTemplate}
                    sortable
                    style={{ width: "140px" }}
                />
                <Column
                    field="user_name"
                    header="Utente"
                    body={userBodyTemplate}
                    sortable
                    style={{ width: "200px" }}
                />
                <Column
                    field="action"
                    header="Azione"
                    body={actionBodyTemplate}
                    style={{ width: "120px" }}
                />
                <Column
                    field="description"
                    header="Descrizione"
                    body={descriptionBodyTemplate}
                />
            </DataTable>

            {/* Statistics Summary */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">
                        {activitiesQuery.data?.filter(
                            (a: UserActivity) =>
                                a.action.toLowerCase() === "login"
                        ).length || 0}
                    </div>
                    <div className="text-sm text-blue-600">Login oggi</div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">
                        {new Set(
                            activitiesQuery.data?.map(
                                (a: UserActivity) => a.user_id
                            )
                        ).size || 0}
                    </div>
                    <div className="text-sm text-green-600">Utenti attivi</div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-700">
                        {activitiesQuery.data?.filter(
                            (a: UserActivity) =>
                                a.action.toLowerCase() === "update"
                        ).length || 0}
                    </div>
                    <div className="text-sm text-yellow-600">Modifiche</div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-700">
                        {activitiesQuery.data?.filter(
                            (a: UserActivity) =>
                                a.action.toLowerCase() === "delete"
                        ).length || 0}
                    </div>
                    <div className="text-sm text-red-600">Eliminazioni</div>
                </div>
            </div>
        </div>
    )
}

export default UserActivities
