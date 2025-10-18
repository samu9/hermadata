import React, { useState } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { Tag } from "primereact/tag"
import { Dialog } from "primereact/dialog"
import { Toast } from "primereact/toast"
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog"
import { useRef } from "react"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { apiService } from "../../main"
import { ManagementUser, UpdateUser } from "../../models/user.schema"
import EditUserForm from "./EditUserForm"

const UserList: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<ManagementUser | null>(
        null
    )
    const [showEditDialog, setShowEditDialog] = useState(false)
    const toast = useRef<Toast>(null)
    const queryClient = useQueryClient()

    const usersQuery = useQuery("users", () => apiService.getAllUsers(), {
        staleTime: 30000, // 30 seconds
    })

    const deleteUserMutation = useMutation(
        (userId: number) => apiService.deleteUser(userId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries("users")
                toast.current?.show({
                    severity: "success",
                    summary: "Successo",
                    detail: "Utente eliminato con successo",
                })
            },
            onError: () => {
                toast.current?.show({
                    severity: "error",
                    summary: "Errore",
                    detail: "Errore durante l'eliminazione dell'utente",
                })
            },
        }
    )

    const toggleUserStatusMutation = useMutation(
        ({ userId, isActive }: { userId: number; isActive: boolean }) =>
            apiService.updateUser(userId, { is_active: isActive }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries("users")
                toast.current?.show({
                    severity: "success",
                    summary: "Successo",
                    detail: "Status utente aggiornato",
                })
            },
        }
    )

    const statusBodyTemplate = (user: ManagementUser) => {
        return (
            <Tag
                value={user.is_active ? "Attivo" : "Inattivo"}
                severity={user.is_active ? "success" : "danger"}
                className="text-sm"
            />
        )
    }

    const roleBodyTemplate = (user: ManagementUser) => {
        return (
            <Tag
                value={user.is_superuser ? "Super Admin" : "Utente"}
                severity={user.is_superuser ? "warning" : "info"}
                className="text-sm"
            />
        )
    }

    const actionsBodyTemplate = (user: ManagementUser) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-text"
                    onClick={() => {
                        setSelectedUser(user)
                        setShowEditDialog(true)
                    }}
                    tooltip="Modifica utente"
                />
                <Button
                    icon={user.is_active ? "pi pi-eye-slash" : "pi pi-eye"}
                    className="p-button-rounded p-button-text"
                    severity={user.is_active ? "warning" : "success"}
                    onClick={() => {
                        confirmDialog({
                            message: `Vuoi ${
                                user.is_active ? "disattivare" : "attivare"
                            } questo utente?`,
                            header: "Conferma",
                            icon: "pi pi-exclamation-triangle",
                            accept: () => {
                                toggleUserStatusMutation.mutate({
                                    userId: user.id,
                                    isActive: !user.is_active,
                                })
                            },
                        })
                    }}
                    tooltip={
                        user.is_active ? "Disattiva utente" : "Attiva utente"
                    }
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-text p-button-danger"
                    onClick={() => {
                        confirmDialog({
                            message:
                                "Sei sicuro di voler eliminare questo utente?",
                            header: "Conferma eliminazione",
                            icon: "pi pi-exclamation-triangle",
                            accept: () => deleteUserMutation.mutate(user.id),
                        })
                    }}
                    tooltip="Elimina utente"
                />
            </div>
        )
    }

    const nameBodyTemplate = (user: ManagementUser) => {
        const fullName = [user.name, user.surname].filter(Boolean).join(" ")
        return fullName || "-"
    }

    const dateBodyTemplate = (user: ManagementUser) => {
        return new Date(user.created_at).toLocaleDateString("it-IT")
    }

    if (usersQuery.isLoading) {
        return <div className="text-center p-4">Caricamento utenti...</div>
    }

    if (usersQuery.error) {
        return (
            <div className="text-center p-4 text-red-600">
                Errore nel caricamento degli utenti
            </div>
        )
    }

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="bg-white">
                <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Lista Utenti ({usersQuery.data?.length || 0})
                    </h2>
                    <Button
                        label="Aggiorna"
                        icon="pi pi-refresh"
                        className="p-button-outlined"
                        onClick={() => queryClient.invalidateQueries("users")}
                        loading={usersQuery.isRefetching}
                    />
                </div>

                <DataTable
                    value={usersQuery.data || []}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    className="p-datatable-sm"
                    emptyMessage="Nessun utente trovato"
                    sortField="created_at"
                    sortOrder={-1}
                >
                    <Column
                        field="id"
                        header="ID"
                        sortable
                        style={{ width: "60px" }}
                    />
                    <Column
                        field="name"
                        header="Nome Completo"
                        body={nameBodyTemplate}
                        sortable
                    />
                    <Column field="email" header="Email" sortable />
                    <Column
                        field="is_active"
                        header="Status"
                        body={statusBodyTemplate}
                        style={{ width: "100px" }}
                    />
                    <Column
                        field="is_superuser"
                        header="Ruolo"
                        body={roleBodyTemplate}
                        style={{ width: "120px" }}
                    />
                    <Column
                        field="created_at"
                        header="Data Creazione"
                        body={dateBodyTemplate}
                        sortable
                        style={{ width: "140px" }}
                    />
                    <Column
                        header="Azioni"
                        body={actionsBodyTemplate}
                        style={{ width: "150px" }}
                    />
                </DataTable>
            </div>

            {/* Edit User Dialog */}
            <Dialog
                header="Modifica Utente"
                visible={showEditDialog}
                onHide={() => {
                    setShowEditDialog(false)
                    setSelectedUser(null)
                }}
                style={{ width: "500px" }}
                modal
            >
                {selectedUser && (
                    <EditUserForm
                        user={selectedUser}
                        onUserUpdated={() => {
                            setShowEditDialog(false)
                            setSelectedUser(null)
                            queryClient.invalidateQueries("users")
                        }}
                        onCancel={() => {
                            setShowEditDialog(false)
                            setSelectedUser(null)
                        }}
                    />
                )}
            </Dialog>
        </>
    )
}

export default UserList
