import { useState } from "react"
import { useParams } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Button } from "primereact/button"
import { Calendar } from "primereact/calendar"
import { Card } from "primereact/card"
import { Dropdown } from "primereact/dropdown"
import { InputNumber } from "primereact/inputnumber"
import { InputTextarea } from "primereact/inputtextarea"
import { Tag } from "primereact/tag"
import { classNames } from "primereact/utils"
import { toastService } from "../../services/toast"
import {
    NewTherapy,
    newTherapySchema,
    ReminderUnit,
    reminderUnitLabels,
} from "../../models/therapy.schema"
import { useCreateTherapyMutation, useTherapiesQuery } from "../../queries"

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

const AnimalHealth = () => {
    const { id } = useParams()
    const animalId = Number(id)
    const [showForm, setShowForm] = useState(false)
    const { data: therapies = [], isLoading } = useTherapiesQuery(animalId)

    const activeTherapies = therapies.filter((t) => !t.end_date)
    const pastTherapies = therapies.filter((t) => !!t.end_date)

    return (
        <div className="flex flex-col gap-6">
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
                                <Card
                                    key={t.id}
                                    className="border-l-4 border-l-blue-500"
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm">
                                                {t.description}
                                            </p>
                                            <Tag
                                                value="In corso"
                                                severity="info"
                                                className="shrink-0"
                                            />
                                        </div>
                                        <div className="flex gap-4 text-xs text-surface-500">
                                            <span>
                                                Inizio:{" "}
                                                {format(
                                                    new Date(t.start_date),
                                                    "d MMMM yyyy",
                                                    { locale: it },
                                                )}
                                            </span>
                                            {t.reminder_value &&
                                                t.reminder_unit && (
                                                    <span>
                                                        Reminder: ogni{" "}
                                                        {t.reminder_value}{" "}
                                                        {
                                                            reminderUnitLabels[
                                                                t.reminder_unit
                                                            ]
                                                        }
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {pastTherapies.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wide">
                                Terapie passate
                            </h3>
                            {pastTherapies.map((t) => (
                                <Card key={t.id} className="opacity-70">
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm">
                                            {t.description}
                                        </p>
                                        <div className="flex gap-4 text-xs text-surface-500">
                                            <span>
                                                {format(
                                                    new Date(t.start_date),
                                                    "d MMM yyyy",
                                                    { locale: it },
                                                )}{" "}
                                                →{" "}
                                                {format(
                                                    new Date(t.end_date!),
                                                    "d MMM yyyy",
                                                    { locale: it },
                                                )}
                                            </span>
                                            {t.reminder_value &&
                                                t.reminder_unit && (
                                                    <span>
                                                        Reminder: ogni{" "}
                                                        {t.reminder_value}{" "}
                                                        {
                                                            reminderUnitLabels[
                                                                t.reminder_unit
                                                            ]
                                                        }
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {therapies.length === 0 && (
                        <div className="text-surface-400 text-sm text-center py-8">
                            Nessuna terapia registrata
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default AnimalHealth
