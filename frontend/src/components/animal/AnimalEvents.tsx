import { useState } from "react"
import { useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { apiService } from "../../main"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import Loader from "../Loader"
import { useAuth } from "../../contexts/AuthContext"
import { Dialog } from "primereact/dialog"
import { Button } from "primereact/button"
import { Dropdown } from "primereact/dropdown"
import { InputTextarea } from "primereact/inputtextarea"
import { classNames } from "primereact/utils"
import { NewAnimalLog } from "../../models/animal.schema"
import { z } from "zod"

const formSchema = z.object({
    event: z.string().min(1, "Seleziona un evento"),
    note: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const AnimalEvents = () => {
    const { id } = useParams()
    const { isSuperUser, can } = useAuth()
    const [visible, setVisible] = useState(false)
    const queryClient = useQueryClient()

    const { data: events, isLoading } = useQuery(["animalLogs", id], () =>
        apiService.getAnimalLogs(id!),
    )

    const { data: eventTypes } = useQuery(["eventTypes"], () =>
        apiService.getAnimalEventTypes(),
    )

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            event: "",
            note: "",
        },
    })

    const createLog = useMutation(
        (data: NewAnimalLog) => apiService.addAnimalLog(id!, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["animalLogs", id])
                setVisible(false)
                form.reset()
                apiService.showSuccess(
                    "L'evento è stato registrato con successo",
                    "Evento aggiunto",
                )
            },
        },
    )

    const onSubmit = (data: FormValues) => {
        const payload: NewAnimalLog = {
            event: data.event,
            data: { note: data.note },
        }
        createLog.mutate(payload)
    }

    if (isLoading) return <Loader />

    const sortedEvents = events?.sort(
        (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )

    return (
        <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-surface-900">
                    Storia Eventi
                </h2>
                {can("AAE") && (
                    <Button
                        label="Aggiungi Evento"
                        icon="pi pi-plus"
                        className="p-button-sm"
                        onClick={() => setVisible(true)}
                    />
                )}
            </div>

            <Dialog
                header="Aggiungi Evento"
                visible={visible}
                onHide={() => setVisible(false)}
                className="w-full max-w-md"
            >
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4 pt-2"
                >
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="event"
                            className="font-medium text-surface-700"
                        >
                            Tipo Evento
                        </label>
                        <Controller
                            name="event"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Dropdown
                                        id="event"
                                        value={field.value}
                                        onChange={(e) =>
                                            field.onChange(e.value)
                                        }
                                        options={eventTypes || []}
                                        optionLabel="description"
                                        optionValue="code"
                                        placeholder="Seleziona un evento"
                                        className={classNames({
                                            "p-invalid": fieldState.error,
                                            "w-full": true,
                                        })}
                                        filter
                                    />
                                    {fieldState.error && (
                                        <small className="text-red-500">
                                            {fieldState.error.message}
                                        </small>
                                    )}
                                </>
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="note"
                            className="font-medium text-surface-700"
                        >
                            Note
                        </label>
                        <Controller
                            name="note"
                            control={form.control}
                            render={({ field }) => (
                                <InputTextarea
                                    id="note"
                                    {...field}
                                    rows={3}
                                    placeholder="Note opzionali..."
                                    className="w-full"
                                />
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            label="Annulla"
                            type="button"
                            severity="secondary"
                            onClick={() => setVisible(false)}
                            text
                        />
                        <Button
                            label="Salva"
                            type="submit"
                            loading={createLog.isLoading}
                        />
                    </div>
                </form>
            </Dialog>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-surface-200" />

                <div className="space-y-8">
                    {sortedEvents?.map((event) => (
                        <div
                            key={event.id}
                            className="relative flex items-start gap-6"
                        >
                            {/* Dot */}
                            <div className="absolute left-0 mt-1.5 w-8 h-8 rounded-full bg-white border-4 border-primary-600 z-10" />

                            <div className="ml-10 flex-1">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-semibold text-surface-900">
                                            {event.event_description ||
                                                event.event}
                                        </h3>
                                        <div className="text-sm text-surface-500 mt-1">
                                            {format(
                                                new Date(event.created_at),
                                                "d MMMM yyyy, HH:mm",
                                                { locale: it },
                                            )}
                                        </div>
                                        {isSuperUser && event.user_id && (
                                            <div className="text-xs text-primary-600 mt-0.5 font-medium">
                                                ID Utente: {event.user_id}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Public Note */}
                                {event.data && (event.data as any)["note"] && (
                                    <div className="mt-2 text-surface-700 bg-surface-50 p-3 rounded-lg border border-surface-200 mb-2">
                                        {String((event.data as any)["note"])}
                                    </div>
                                )}

                                {isSuperUser &&
                                    event.data &&
                                    Object.keys(event.data).filter(
                                        (k) => k !== "note",
                                    ).length > 0 && (
                                        <div className="bg-surface-50 rounded-lg p-3 text-sm border border-surface-200">
                                            <div className="grid grid-cols-1 gap-1">
                                                {Object.entries(event.data)
                                                    .filter(
                                                        ([key]) =>
                                                            key !== "note",
                                                    )
                                                    .map(([key, value]) => (
                                                        <div
                                                            key={key}
                                                            className="flex gap-2"
                                                        >
                                                            <span className="font-medium text-surface-700 min-w-[120px]">
                                                                {formatDataKey(
                                                                    key,
                                                                )}
                                                                :
                                                            </span>
                                                            <span className="text-surface-600 break-all">
                                                                {formatDataValue(
                                                                    value,
                                                                )}
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    ))}

                    {(!sortedEvents || sortedEvents.length === 0) && (
                        <div className="text-center text-surface-500 py-8">
                            Nessun evento registrato
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Helper to format data keys nicely
const formatDataKey = (key: string) => {
    return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

// Helper to format data values
const formatDataValue = (value: any): string => {
    if (value === null || value === undefined) return "-"
    if (typeof value === "object") return JSON.stringify(value)
    if (typeof value === "boolean") return value ? "Sì" : "No"
    return String(value)
}

export default AnimalEvents
