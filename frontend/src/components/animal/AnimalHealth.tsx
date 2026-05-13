import { useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faBell,
    faCalendarDay,
    faCalendarCheck,
    faFileLines,
    faPills,
    faTruck,
} from "@fortawesome/free-solid-svg-icons"
import {
    addDays,
    addMonths,
    addWeeks,
    addYears,
    differenceInDays,
    format,
} from "date-fns"
import { it } from "date-fns/locale"
import { Button } from "primereact/button"
import { Calendar } from "primereact/calendar"
import { Card } from "primereact/card"
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog"
import { Divider } from "primereact/divider"
import { Dropdown } from "primereact/dropdown"
import { InputNumber } from "primereact/inputnumber"
import { InputTextarea } from "primereact/inputtextarea"
import { classNames } from "primereact/utils"
import { toastService } from "../../services/toast"
import {
    NewTherapy,
    newTherapySchema,
    ReminderUnit,
    reminderUnitLabels,
    Therapy,
} from "../../models/therapy.schema"
import { apiService } from "../../main"
import {
    useCreateTherapyMutation,
    useEndTherapyMutation,
    useTherapiesQuery,
} from "../../queries"

const REMINDER_UNIT_OPTIONS: { label: string; value: ReminderUnit }[] = [
    { label: "giorni", value: "day" },
    { label: "settimane", value: "week" },
    { label: "mesi", value: "month" },
    { label: "anni", value: "year" },
]

const TherapyForm = ({
    animalId,
    onSuccess,
}: {
    animalId: number
    onSuccess: () => void
}) => {
    const mutation = useCreateTherapyMutation(animalId)

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<NewTherapy>({
        resolver: zodResolver(newTherapySchema),
        defaultValues: {
            start_date: "",
            end_date: null,
            description: "",
            reminder_value: null,
            reminder_unit: null,
        },
    })

    const onSubmit = async (values: NewTherapy) => {
        try {
            await mutation.mutateAsync(values)
            toastService.showSuccess("Terapia salvata")
            reset()
            onSuccess()
        } catch {
            // error already toasted by ApiService interceptor
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">
                        Data inizio <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="start_date"
                        control={control}
                        render={({ field }) => (
                            <Calendar
                                value={
                                    field.value ? new Date(field.value) : null
                                }
                                onChange={(e) =>
                                    field.onChange(
                                        e.value
                                            ? format(
                                                  e.value as Date,
                                                  "yyyy-MM-dd",
                                              )
                                            : "",
                                    )
                                }
                                dateFormat="dd/mm/yy"
                                locale="it"
                                showIcon
                                className={classNames("w-full", {
                                    "p-invalid": !!errors.start_date,
                                })}
                            />
                        )}
                    />
                    {errors.start_date && (
                        <small className="text-red-500">
                            {errors.start_date.message}
                        </small>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">
                        Data fine{" "}
                        <span className="text-surface-400 text-xs">
                            (vuoto = in corso)
                        </span>
                    </label>
                    <Controller
                        name="end_date"
                        control={control}
                        render={({ field }) => (
                            <Calendar
                                value={
                                    field.value ? new Date(field.value) : null
                                }
                                onChange={(e) =>
                                    field.onChange(
                                        e.value
                                            ? format(
                                                  e.value as Date,
                                                  "yyyy-MM-dd",
                                              )
                                            : null,
                                    )
                                }
                                dateFormat="dd/mm/yy"
                                locale="it"
                                showIcon
                                showButtonBar
                                className="w-full"
                            />
                        )}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                    Descrizione <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <InputTextarea
                            {...field}
                            rows={3}
                            placeholder="Es. Amoxicillina 500mg ogni giorno per 5 giorni"
                            className={classNames("w-full", {
                                "p-invalid": !!errors.description,
                            })}
                        />
                    )}
                />
                {errors.description && (
                    <small className="text-red-500">
                        {errors.description.message}
                    </small>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Reminder</label>
                <div className="flex gap-2 items-center">
                    <span className="text-sm text-surface-500">ogni</span>
                    <Controller
                        name="reminder_value"
                        control={control}
                        render={({ field }) => (
                            <InputNumber
                                value={field.value ?? null}
                                onValueChange={(e) =>
                                    field.onChange(e.value ?? null)
                                }
                                min={1}
                                max={999}
                                className="w-24"
                                inputClassName="w-full"
                                placeholder="N"
                            />
                        )}
                    />
                    <Controller
                        name="reminder_unit"
                        control={control}
                        render={({ field }) => (
                            <Dropdown
                                value={field.value}
                                options={REMINDER_UNIT_OPTIONS}
                                onChange={(e) => field.onChange(e.value)}
                                placeholder="unità"
                                className="w-36"
                                showClear
                            />
                        )}
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    type="submit"
                    label="Salva terapia"
                    icon="pi pi-save"
                    loading={mutation.isLoading}
                />
            </div>
        </form>
    )
}

const getNextDueDate = (startDate: string, value: number, unit: ReminderUnit): Date => {
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (start >= today) return start

    const addPeriod = (d: Date): Date => {
        switch (unit) {
            case "day":   return addDays(d, value)
            case "week":  return addWeeks(d, value)
            case "month": return addMonths(d, value)
            case "year":  return addYears(d, value)
        }
    }

    let next = start
    while (next < today) next = addPeriod(next)
    return next
}

const dueDateStyle = (due: Date): { label: string; className: string } => {
    const days = differenceInDays(due, new Date())
    if (days === 0) return { label: "Oggi", className: "text-amber-700 bg-amber-50 border-amber-200" }
    if (days <= 7) return { label: `Tra ${days} giorni`, className: "text-amber-700 bg-amber-50 border-amber-200" }
    return { label: format(due, "d MMM yyyy", { locale: it }), className: "text-surface-600 bg-surface-50 border-surface-200" }
}

type DocType = "prescription" | "transport"

const DOC_META: Record<DocType, { label: string; icon: typeof faFileLines }> = {
    prescription: { label: "Ricetta medica", icon: faFileLines },
    transport: { label: "Documento di trasporto", icon: faTruck },
}

const DocSlot = ({
    animalId,
    therapyId,
    docType,
    documentId,
    onAttached,
}: {
    animalId: number
    therapyId: number
    docType: DocType
    documentId: number | null
    onAttached: () => void
}) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const { label, icon } = DOC_META[docType]

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const docId = await apiService.uploadDoc(file)
            await apiService.attachTherapyDocument(animalId, therapyId, docType, docId)
            onAttached()
            toastService.showSuccess(`${label} allegata`)
        } catch {
            // errors toasted by interceptor
        } finally {
            setUploading(false)
            if (inputRef.current) inputRef.current.value = ""
        }
    }

    return (
        <div className="flex items-center justify-between gap-3 py-1.5 border-t border-surface-100 first:border-t-0">
            <span className="flex items-center gap-2 text-sm text-surface-600">
                <FontAwesomeIcon icon={icon} className="text-surface-400 text-xs w-3" />
                {label}
            </span>
            {documentId ? (
                <Button
                    label="Apri"
                    icon="pi pi-external-link"
                    size="small"
                    text
                    onClick={() => apiService.openDocument(documentId)}
                />
            ) : (
                <>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf,image/*"
                        className="hidden"
                        onChange={handleFile}
                    />
                    <Button
                        label="Carica"
                        icon="pi pi-upload"
                        size="small"
                        text
                        loading={uploading}
                        onClick={() => inputRef.current?.click()}
                    />
                </>
            )}
        </div>
    )
}

const TherapyCard = ({
    therapy,
    active,
    animalId,
    onEnd,
    onDocAttached,
}: {
    therapy: Therapy
    active: boolean
    animalId: number
    onEnd?: () => void
    onDocAttached: () => void
}) => (
    <div
        className={classNames(
            "rounded-xl border overflow-hidden shadow-sm",
            active
                ? "border-primary-200 bg-white"
                : "border-surface-200 bg-surface-50 opacity-75",
        )}
    >
        {/* Top accent bar */}
        <div className={classNames("h-1 w-full", active ? "bg-primary-500" : "bg-surface-300")} />

        <div className="p-5 flex gap-4">
            {/* Left icon */}
            <div
                className={classNames(
                    "shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl",
                    active
                        ? "bg-primary-100 text-primary-600"
                        : "bg-surface-200 text-surface-400",
                )}
            >
                <FontAwesomeIcon icon={faPills} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-3">
                {/* Header row */}
                <p className="text-base font-semibold text-surface-900 leading-snug">
                    {therapy.description}
                </p>

                {/* Meta row */}
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-surface-500">
                    <span className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faCalendarDay} className="text-surface-400 text-xs" />
                        <span>
                            Inizio:{" "}
                            <span className="font-medium text-surface-700">
                                {format(new Date(therapy.start_date), "d MMM yyyy", { locale: it })}
                            </span>
                        </span>
                    </span>

                    {therapy.end_date && (
                        <span className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faCalendarCheck} className="text-surface-400 text-xs" />
                            <span>
                                Fine:{" "}
                                <span className="font-medium text-surface-700">
                                    {format(new Date(therapy.end_date), "d MMM yyyy", { locale: it })}
                                </span>
                            </span>
                        </span>
                    )}

                    {therapy.reminder_value && therapy.reminder_unit && (
                        <span className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faBell} className="text-amber-400 text-xs" />
                            <span>
                                ogni{" "}
                                <span className="font-medium text-surface-700">
                                    {therapy.reminder_value}{" "}
                                    {reminderUnitLabels[therapy.reminder_unit]}
                                </span>
                            </span>
                        </span>
                    )}
                    {active && therapy.reminder_value && therapy.reminder_unit && (() => {
                        const due = getNextDueDate(therapy.start_date, therapy.reminder_value, therapy.reminder_unit)
                        const style = dueDateStyle(due)
                        return (
                            <span className={`flex items-center gap-1.5 text-xs font-medium border rounded-full px-2.5 py-0.5 ${style.className}`}>
                                <FontAwesomeIcon icon={faCalendarDay} className="text-xs" />
                                Prossima: {style.label}
                            </span>
                        )
                    })()}
                </div>

                {/* Document attachments */}
                <div className="mt-1 flex flex-col">
                    {(["prescription", "transport"] as DocType[]).map((dt) => (
                        <DocSlot
                            key={dt}
                            animalId={animalId}
                            therapyId={therapy.id}
                            docType={dt}
                            documentId={
                                dt === "prescription"
                                    ? therapy.prescription_document_id
                                    : therapy.transport_document_id
                            }
                            onAttached={onDocAttached}
                        />
                    ))}
                </div>

                {active && onEnd && (
                    <div className="flex justify-end pt-1">
                        <Button
                            label="Termina terapia"
                            icon="pi pi-stop-circle"
                            severity="danger"
                            text
                            size="small"
                            onClick={onEnd}
                        />
                    </div>
                )}
            </div>
        </div>
    </div>
)

const AnimalHealth = () => {
    const { id } = useParams()
    const animalId = Number(id)
    const [showForm, setShowForm] = useState(false)
    const { data: therapies = [], isLoading, refetch } = useTherapiesQuery(animalId)
    const endMutation = useEndTherapyMutation(animalId)

    const handleEnd = (therapyId: number) => {
        confirmDialog({
            message: "Vuoi terminare questa terapia? Verrà impostata la data di fine ad oggi.",
            header: "Termina terapia",
            icon: "pi pi-exclamation-triangle",
            acceptLabel: "Termina",
            rejectLabel: "Annulla",
            acceptClassName: "p-button-danger",
            accept: async () => {
                try {
                    await endMutation.mutateAsync(therapyId)
                    toastService.showSuccess("Terapia terminata")
                } catch {
                    // error toasted by interceptor
                }
            },
        })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const activeTherapies = therapies.filter(
        (t) => !t.end_date || new Date(t.end_date) >= today,
    )
    const pastTherapies = therapies.filter(
        (t) => !!t.end_date && new Date(t.end_date) < today,
    )

    return (
        <div className="flex flex-col gap-6">
            <ConfirmDialog />
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Scheda sanitaria</h2>
                <Button
                    label="Nuova terapia"
                    icon="pi pi-plus"
                    onClick={() => setShowForm((v) => !v)}
                    outlined={showForm}
                />
            </div>

            {showForm && (
                <Card title="Nuova terapia">
                    <TherapyForm
                        animalId={animalId}
                        onSuccess={() => setShowForm(false)}
                    />
                </Card>
            )}

            {isLoading ? (
                <div className="text-surface-400">Caricamento...</div>
            ) : (
                <>
                    {activeTherapies.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wide">
                                Terapie in corso
                            </h3>
                            {activeTherapies.map((t) => (
                                <TherapyCard
                                    key={t.id}
                                    therapy={t}
                                    active
                                    animalId={animalId}
                                    onEnd={() => handleEnd(t.id)}
                                    onDocAttached={refetch}
                                />
                            ))}
                        </div>
                    )}

                    {activeTherapies.length > 0 && pastTherapies.length > 0 && (
                        <Divider />
                    )}

                    {pastTherapies.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wide">
                                Terapie passate
                            </h3>
                            {pastTherapies.map((t) => (
                                <TherapyCard
                                    key={t.id}
                                    therapy={t}
                                    active={false}
                                    animalId={animalId}
                                    onDocAttached={refetch}
                                />
                            ))}
                        </div>
                    )}

                    {therapies.length === 0 && (
                        <div className="text-surface-400 text-sm text-center py-12">
                            Nessuna terapia registrata
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default AnimalHealth
