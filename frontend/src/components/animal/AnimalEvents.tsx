import { useParams } from "react-router-dom"
import { useQuery } from "react-query"
import { apiService } from "../../main"
import { ANIMAL_EVENT_LABELS } from "../../constants"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import Loader from "../Loader"
import { useAuth } from "../../contexts/AuthContext"

const AnimalEvents = () => {
    const { id } = useParams()
    const { isSuperUser } = useAuth()

    const { data: events, isLoading } = useQuery(["animalLogs", id], () =>
        apiService.getAnimalLogs(id!),
    )

    if (isLoading) return <Loader />

    const sortedEvents = events?.sort(
        (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )

    return (
        <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
            <h2 className="text-2xl font-bold text-surface-900 mb-6">
                Storia Eventi
            </h2>
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
                                            {ANIMAL_EVENT_LABELS[event.event] ||
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

                                {isSuperUser &&
                                    event.data &&
                                    Object.keys(event.data).length > 0 && (
                                        <div className="bg-surface-50 rounded-lg p-3 text-sm border border-surface-200">
                                            <div className="grid grid-cols-1 gap-1">
                                                {Object.entries(event.data).map(
                                                    ([key, value]) => (
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
                                                    ),
                                                )}
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
