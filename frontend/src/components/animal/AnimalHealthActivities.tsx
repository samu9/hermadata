import { useState } from "react"
import { format, parseISO } from "date-fns"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { confirmDialog } from "primereact/confirmdialog"
import { DataTable } from "primereact/datatable"
import { Dialog } from "primereact/dialog"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from "primereact/inputtextarea"
import { Permission } from "../../constants"
import { useAuth } from "../../contexts/AuthContext"
import {
    HealthActivity,
    HealthActivityFilters,
    HealthActivityWrite,
    healthActivityWriteSchema,
} from "../../models/healthActivity.schema"
import {
    useDeleteHealthActivityMutation,
    useHealthActivitiesQuery,
    useSaveHealthActivityMutation,
} from "../../queries"
import { toastService } from "../../services/toast"

const AnimalHealthActivities = ({ animalId }: { animalId: number }) => {
    const { can } = useAuth()
    const canBrowse = can(Permission.BROWSE_HEALTH_ACTIVITY)
    const canCreate = can(Permission.CREATE_HEALTH_ACTIVITY)
    const canEdit = can(Permission.EDIT_HEALTH_ACTIVITY)
    const canDelete = can(Permission.DELETE_HEALTH_ACTIVITY)
    const [filters, setFilters] = useState<HealthActivityFilters>({})
    const [search, setSearch] = useState<HealthActivityFilters>({})
    const [first, setFirst] = useState(0)
    const [editing, setEditing] = useState<HealthActivity | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState<HealthActivityWrite>({
        activity_date: format(new Date(), "yyyy-MM-dd"), description: "",
    })
    const [formError, setFormError] = useState("")
    const invalidRange = !!(filters.from_date && filters.to_date
        && filters.from_date > filters.to_date)
    const query = useHealthActivitiesQuery(animalId, search, canBrowse)
    const save = useSaveHealthActivityMutation(animalId)
    const remove = useDeleteHealthActivityMutation(animalId)

    if (!canBrowse) return null

    const openForm = (activity: HealthActivity | null) => {
        setEditing(activity)
        setForm(activity ? {
            activity_date: activity.activity_date, description: activity.description,
        } : { activity_date: format(new Date(), "yyyy-MM-dd"), description: "" })
        setFormError("")
        setShowForm(true)
    }

    const handleDelete = (activity: HealthActivity) => confirmDialog({
        header: "Elimina attività sanitaria",
        message: "Vuoi eliminare questa attività sanitaria?",
        icon: "pi pi-exclamation-triangle",
        acceptLabel: "Elimina", rejectLabel: "Annulla",
        acceptClassName: "p-button-danger",
        accept: async () => {
            try {
                await remove.mutateAsync(activity.id)
                setFirst(0)
                toastService.showSuccess("Attività sanitaria eliminata")
            } catch { /* HTTP errors are toasted by the API interceptor. */ }
        },
    })

    const hasFilters = !!(search.description || search.from_date || search.to_date)
    return <section className="flex flex-col gap-4" aria-labelledby="health-register-title">
        <div className="flex items-center justify-between">
            <h2 id="health-register-title" className="text-lg font-semibold">Registro attività sanitarie</h2>
            {canCreate && <Button label="Nuova attività" icon="pi pi-plus" onClick={() => openForm(null)} />}
        </div>
        <form className="flex flex-wrap items-end gap-3" onSubmit={(event) => {
            event.preventDefault()
            if (!invalidRange) {
                setSearch({ ...filters, description: filters.description?.trim() || undefined })
                setFirst(0)
            }
        }}>
            <div className="flex flex-col gap-1 flex-1">
                <label htmlFor="health-description-filter">Descrizione</label>
                <InputText id="health-description-filter" value={filters.description || ""}
                    placeholder="Cerca nella descrizione"
                    onChange={(event) => setFilters({ ...filters, description: event.target.value })} />
            </div>
            <div className="flex flex-col gap-1">
                <label htmlFor="health-from">Dal</label>
                <InputText id="health-from" type="date" value={filters.from_date || ""}
                    onChange={(event) => setFilters({ ...filters, from_date: event.target.value || undefined })} />
            </div>
            <div className="flex flex-col gap-1">
                <label htmlFor="health-to">Al</label>
                <InputText id="health-to" type="date" value={filters.to_date || ""}
                    onChange={(event) => setFilters({ ...filters, to_date: event.target.value || undefined })} />
            </div>
            <Button type="submit" label="Cerca" icon="pi pi-search" disabled={invalidRange} />
            <Button type="button" label="Reimposta" outlined onClick={() => {
                setFilters({}); setSearch({}); setFirst(0)
            }} />
            {invalidRange && <p role="alert" className="text-red-600 w-full">La data iniziale deve precedere o coincidere con la data finale.</p>}
        </form>
        {query.isError ? <div role="alert" className="flex items-center gap-3">
            <span>Impossibile caricare le attività sanitarie.</span>
            <Button label="Riprova" outlined onClick={() => query.refetch()} />
        </div> : <DataTable value={query.data || []} dataKey="id" loading={query.isLoading || query.isFetching}
            paginator rows={10} first={first} onPage={(event) => setFirst(event.first)}
            emptyMessage={hasFilters ? "Nessuna attività corrisponde ai filtri" : "Nessuna attività sanitaria registrata"}>
            <Column field="activity_date" header="Data" style={{ width: "10rem" }}
                body={(activity: HealthActivity) => format(parseISO(activity.activity_date), "dd/MM/yyyy")} />
            <Column field="description" header="Descrizione"
                body={(activity: HealthActivity) => <span className="whitespace-pre-wrap break-words">{activity.description}</span>} />
            {(canEdit || canDelete) && <Column header="Azioni" style={{ width: "8rem" }}
                body={(activity: HealthActivity) => <div className="flex gap-1">
                    {canEdit && <Button icon="pi pi-pencil" text aria-label="Modifica attività" onClick={() => openForm(activity)} />}
                    {canDelete && <Button icon="pi pi-trash" text severity="danger" aria-label="Elimina attività"
                        disabled={remove.isLoading} onClick={() => handleDelete(activity)} />}
                </div>} />}
        </DataTable>}
        <Dialog header={editing ? "Modifica attività sanitaria" : "Nuova attività sanitaria"}
            visible={showForm} onHide={() => { if (!save.isLoading) setShowForm(false) }}
            style={{ width: "36rem" }} modal closable={!save.isLoading}>
            <form className="flex flex-col gap-4" onSubmit={async (event) => {
                event.preventDefault()
                const result = healthActivityWriteSchema.safeParse(form)
                if (!result.success) {
                    setFormError(result.error.issues[0].message)
                    return
                }
                setFormError("")
                try {
                    await save.mutateAsync({ id: editing?.id, data: result.data })
                    setShowForm(false)
                    setFirst(0)
                    toastService.showSuccess(editing ? "Attività sanitaria aggiornata" : "Attività sanitaria aggiunta")
                } catch { /* Keep the form open so the user can retry. */ }
            }}>
                <div className="flex flex-col gap-1">
                    <label htmlFor="health-activity-date">Data</label>
                    <InputText id="health-activity-date" type="date" required value={form.activity_date}
                        onChange={(event) => setForm({ ...form, activity_date: event.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="health-activity-description">Descrizione</label>
                    <InputTextarea id="health-activity-description" required rows={5} value={form.description}
                        onChange={(event) => setForm({ ...form, description: event.target.value })} />
                </div>
                {formError && <p role="alert" className="text-red-600">{formError}</p>}
                <div className="flex justify-end gap-2">
                    <Button type="button" label="Annulla" outlined disabled={save.isLoading} onClick={() => setShowForm(false)} />
                    <Button type="submit" label="Salva" loading={save.isLoading} />
                </div>
            </form>
        </Dialog>
    </section>
}

export default AnimalHealthActivities
