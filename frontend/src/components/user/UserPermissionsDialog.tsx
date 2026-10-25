import React, { useEffect, useMemo, useRef, useState } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { Tag } from "primereact/tag"
import { Toast } from "primereact/toast"
import { Message } from "primereact/message"
import { SelectButton } from "primereact/selectbutton"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { apiService } from "../../main"
import { ManagementUser } from "../../models/user.schema"
import {
    UserPermissionDetail,
    UserPermissionOverride,
} from "../../models/permission.schema"

type OverrideState = "inherit" | "grant" | "revoke"

const overrideOptions: { label: string; value: OverrideState }[] = [
    { label: "Eredita", value: "inherit" },
    { label: "Concedi", value: "grant" },
    { label: "Revoca", value: "revoke" },
]

const toState = (override: boolean | null): OverrideState =>
    override === null ? "inherit" : override ? "grant" : "revoke"

interface UserPermissionsDialogProps {
    user: ManagementUser
    onSaved: () => void
    onCancel: () => void
}

const UserPermissionsDialog: React.FC<UserPermissionsDialogProps> = ({
    user,
    onSaved,
    onCancel,
}) => {
    const toast = useRef<Toast>(null)
    const queryClient = useQueryClient()
    const queryKey = ["user-permissions", user.id]

    const permissionsQuery = useQuery(queryKey, () =>
        apiService.getUserPermissions(user.id),
    )

    // local, unsaved override state: permission code -> state
    const [overrides, setOverrides] = useState<Record<string, OverrideState>>(
        {},
    )

    useEffect(() => {
        if (permissionsQuery.data) {
            setOverrides(
                Object.fromEntries(
                    permissionsQuery.data.map((p) => [
                        p.code,
                        toState(p.override),
                    ]),
                ),
            )
        }
    }, [permissionsQuery.data])

    const isEffective = (p: UserPermissionDetail) => {
        const state = overrides[p.code] ?? "inherit"
        if (state === "inherit") return p.from_role
        return state === "grant"
    }

    const summary = useMemo(() => {
        const rows = permissionsQuery.data ?? []
        return {
            fromRole: rows.filter((p) => p.from_role).length,
            granted: Object.values(overrides).filter((s) => s === "grant")
                .length,
            revoked: Object.values(overrides).filter((s) => s === "revoke")
                .length,
            effective: rows.filter(isEffective).length,
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [permissionsQuery.data, overrides])

    const saveMutation = useMutation(
        (data: UserPermissionOverride[]) =>
            apiService.setUserPermissions(user.id, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(queryKey)
                toast.current?.show({
                    severity: "success",
                    summary: "Successo",
                    detail: "Permessi aggiornati con successo",
                })
                onSaved()
            },
            onError: () => {
                toast.current?.show({
                    severity: "error",
                    summary: "Errore",
                    detail: "Errore durante il salvataggio dei permessi",
                })
            },
        },
    )

    const onSave = () => {
        const data: UserPermissionOverride[] = Object.entries(overrides)
            .filter(([, state]) => state !== "inherit")
            .map(([code, state]) => ({
                permission_code: code,
                granted: state === "grant",
            }))
        saveMutation.mutate(data)
    }

    const readOnly = user.is_superuser

    if (permissionsQuery.isLoading) {
        return <div className="text-center p-4">Caricamento permessi...</div>
    }

    if (permissionsQuery.error) {
        return (
            <div className="text-center p-4 text-red-600">
                Errore nel caricamento dei permessi
            </div>
        )
    }

    const fromRoleBody = (p: UserPermissionDetail) =>
        p.from_role ? (
            <i
                className="pi pi-check-circle text-green-600"
                title="Concesso dal ruolo"
            />
        ) : (
            <i
                className="pi pi-minus-circle text-surface-400"
                title="Non concesso dal ruolo"
            />
        )

    const overrideBody = (p: UserPermissionDetail) => (
        <SelectButton
            value={overrides[p.code] ?? "inherit"}
            options={overrideOptions}
            disabled={readOnly}
            allowEmpty={false}
            onChange={(e) =>
                setOverrides((prev) => ({ ...prev, [p.code]: e.value }))
            }
            pt={{ button: { className: "!py-1 !px-2 !text-xs" } }}
        />
    )

    const effectiveBody = (p: UserPermissionDetail) => {
        const effective = readOnly || isEffective(p)
        return (
            <Tag
                value={effective ? "Sì" : "No"}
                severity={effective ? "success" : undefined}
                className={
                    effective ? "text-sm" : "text-sm !bg-surface-300"
                }
            />
        )
    }

    const rowClassName = (p: UserPermissionDetail) => {
        const state = overrides[p.code] ?? "inherit"
        if (state === "grant") return "!bg-green-50"
        if (state === "revoke") return "!bg-red-50"
        return ""
    }

    return (
        <>
            <Toast ref={toast} />
            <div className="flex flex-col gap-4">
                {readOnly ? (
                    <Message
                        severity="warn"
                        text="Questo utente è un Super Admin e possiede tutti i permessi: le personalizzazioni non hanno effetto."
                    />
                ) : (
                    <Message
                        severity="info"
                        text="Le modifiche saranno attive al prossimo accesso dell'utente."
                    />
                )}

                <div className="flex gap-2 flex-wrap text-sm">
                    <Tag
                        value={`Ruolo: ${user.role_name ?? "nessuno"}`}
                        className="!bg-surface-200 !text-surface-700"
                    />
                    <Tag
                        value={`${summary.fromRole} dal ruolo`}
                        severity="info"
                    />
                    <Tag
                        value={`${summary.granted} concessi`}
                        severity="success"
                    />
                    <Tag
                        value={`${summary.revoked} revocati`}
                        severity="danger"
                    />
                    <Tag
                        value={`${summary.effective} effettivi`}
                        className="!bg-surface-700"
                    />
                </div>

                <DataTable
                    value={permissionsQuery.data ?? []}
                    dataKey="code"
                    className="p-datatable-sm"
                    rowClassName={rowClassName}
                    scrollable
                    scrollHeight="55vh"
                    emptyMessage="Nessun permesso trovato"
                >
                    <Column
                        field="code"
                        header="Codice"
                        style={{ width: "80px" }}
                        className="font-mono"
                    />
                    <Column field="description" header="Descrizione" />
                    <Column
                        header="Da ruolo"
                        body={fromRoleBody}
                        style={{ width: "90px" }}
                        bodyClassName="text-center"
                    />
                    <Column
                        header="Personalizzazione"
                        body={overrideBody}
                        style={{ width: "260px" }}
                    />
                    <Column
                        header="Effettivo"
                        body={effectiveBody}
                        style={{ width: "90px" }}
                    />
                </DataTable>

                <div className="flex justify-end gap-2">
                    <Button
                        label="Annulla"
                        className="p-button-text"
                        onClick={onCancel}
                    />
                    <Button
                        label="Salva"
                        icon="pi pi-check"
                        onClick={onSave}
                        disabled={readOnly}
                        loading={saveMutation.isLoading}
                    />
                </div>
            </div>
        </>
    )
}

export default UserPermissionsDialog
