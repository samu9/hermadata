import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faBell,
    faHospital,
    faHouse,
    faPills,
} from "@fortawesome/free-solid-svg-icons"
import { differenceInDays, format } from "date-fns"
import { it } from "date-fns/locale"
import { MultiSelect } from "primereact/multiselect"
import { Skeleton } from "primereact/skeleton"
import { classNames } from "primereact/utils"
import { TherapyReminder, reminderUnitLabels } from "../models/therapy.schema"
import { Structure } from "../models/structure.schema"
import { useStructuresQuery, useTherapyRemindersQuery } from "../queries"

const urgency = (
    nextDue: string,
): { label: string; rowClass: string; badgeClass: string } => {
    const days = differenceInDays(new Date(nextDue), new Date())
    if (days === 0)
        return {
            label: "Oggi",
            rowClass: "bg-amber-50 border-l-4 border-l-amber-400",
            badgeClass: "text-amber-700 bg-amber-100",
        }
    if (days <= 7)
        return {
            label: `Tra ${days}g`,
            rowClass: "bg-amber-50/40 border-l-4 border-l-amber-200",
            badgeClass: "text-amber-600 bg-amber-50 border border-amber-200",
        }
    return {
        label: format(new Date(nextDue), "d MMM", { locale: it }),
        rowClass: "",
        badgeClass: "text-surface-500 bg-surface-100",
    }
}

const ReminderRow = ({ reminder }: { reminder: TherapyReminder }) => {
    const navigate = useNavigate()
    const { label, rowClass, badgeClass } = urgency(reminder.next_due_date)

    return (
        <div
            className={classNames(
                "flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-50 transition-colors border-b border-surface-100 last:border-0",
                rowClass,
            )}
            onClick={() =>
                navigate(`/animal/${reminder.animal_id}/health`)
            }
        >
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faPills} className="text-xs" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-surface-800 truncate">
                    <span className="truncate">
                        {reminder.animal_name || reminder.animal_code}
                    </span>
                    <span className="text-surface-300 font-normal">·</span>
                    <span className="text-surface-500 font-normal text-xs truncate">
                        {reminder.animal_code}
                    </span>
                </div>
                <div className="text-xs text-surface-500 truncate mt-0.5">
                    {reminder.description}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-surface-400">
                    ogni {reminder.reminder_value}{" "}
                    {reminderUnitLabels[reminder.reminder_unit]}
                </span>
                <span
                    className={classNames(
                        "text-xs font-semibold rounded-full px-2 py-0.5",
                        badgeClass,
                    )}
                >
                    {label}
                </span>
            </div>
        </div>
    )
}

const TherapyRemindersCard = () => {
    const { data: structures = [] } = useStructuresQuery()
    const [selectedIds, setSelectedIds] = useState<number[]>([])

    useEffect(() => {
        if (structures.length > 0 && selectedIds.length === 0) {
            setSelectedIds(structures.map((s) => s.id))
        }
    }, [structures])

    const { data: reminders = [], isLoading } = useTherapyRemindersQuery(
        selectedIds,
        30,
    )

    return (
        <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-surface-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                        icon={faBell}
                        className="text-amber-500"
                    />
                    <span className="font-semibold text-surface-800">
                        Terapie in scadenza
                    </span>
                    {!isLoading && reminders.length > 0 && (
                        <span className="text-xs font-semibold bg-primary-100 text-primary-700 rounded-full px-2 py-0.5">
                            {reminders.length}
                        </span>
                    )}
                </div>

                {structures.length > 1 && (
                    <MultiSelect
                        value={selectedIds}
                        options={structures}
                        optionLabel="name"
                        optionValue="id"
                        onChange={(e) => setSelectedIds(e.value)}
                        placeholder="Tutte le strutture"
                        maxSelectedLabels={2}
                        selectedItemsLabel="{0} selezionate"
                        className="text-sm"
                        pt={{
                            root: {
                                className:
                                    "!border-surface-200 !rounded-lg !text-sm !py-0",
                            },
                            label: { className: "!text-sm !py-1.5 !px-3" },
                        }}
                        itemTemplate={(s: Structure) => (
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon
                                    icon={
                                        s.structure_type === "S"
                                            ? faHospital
                                            : faHouse
                                    }
                                    className={
                                        s.structure_type === "S"
                                            ? "text-red-400"
                                            : "text-green-500"
                                    }
                                />
                                <span>{s.name}</span>
                            </div>
                        )}
                    />
                )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto max-h-96">
                {isLoading ? (
                    <div className="p-4 space-y-3">
                        {Array(4)
                            .fill(0)
                            .map((_, i) => (
                                <Skeleton key={i} height="3rem" className="!rounded-lg" />
                            ))}
                    </div>
                ) : reminders.length === 0 ? (
                    <div className="text-center text-surface-400 text-sm py-10">
                        Nessuna terapia in scadenza nei prossimi 30 giorni
                    </div>
                ) : (
                    <div>
                        {reminders.map((r) => (
                            <ReminderRow key={r.therapy_id} reminder={r} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default TherapyRemindersCard
