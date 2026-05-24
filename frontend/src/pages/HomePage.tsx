import TherapyRemindersCard from "../components/TherapyRemindersCard"
import { Button } from "primereact/button"
import { Calendar } from "primereact/calendar"
import { MultiSelect } from "primereact/multiselect"
import { Skeleton } from "primereact/skeleton"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { useNavigate } from "react-router-dom"
import { PageTitle, SectionTitle } from "../components/typography"
import {
    useAnimalStatsQuery,
    useRecentAnimalsQuery,
    useRacesQuery,
    useStructuresQuery,
} from "../queries"
import { useAuth } from "../contexts/AuthContext"
import { AnimalSearchResult } from "../models/animal.schema"
import { classNames } from "primereact/utils"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faArrowRight,
    faChartBar,
    faDatabase,
    faDownload,
    faUpload,
    faArrowUp,
    faArrowDown,
    faMinus,
} from "@fortawesome/free-solid-svg-icons"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { useState, useMemo } from "react"

type PeriodPreset = "this_month" | "last_month" | "last_3_months" | "custom"

const formatDate = (date: Date | null) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("it-IT")
}

const toISODate = (d: Date) => format(d, "yyyy-MM-dd")

const StatCard = ({
    title,
    value,
    icon,
    colorClass,
    bgClass,
    loading,
    subtitle,
}: {
    title: string
    value: number | string
    icon: string
    colorClass: string
    bgClass: string
    loading?: boolean
    subtitle?: string
}) => (
    <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6 flex items-center justify-between transition-transform hover:-translate-y-1 duration-200">
        <div>
            <div className="text-surface-500 font-medium text-sm uppercase tracking-wide mb-2">
                {title}
            </div>
            {loading ? (
                <Skeleton width="4rem" height="2rem" />
            ) : (
                <div className={classNames("text-3xl font-bold", colorClass)}>
                    {value}
                </div>
            )}
            {subtitle && (
                <div className="text-surface-400 text-xs mt-1">{subtitle}</div>
            )}
        </div>
        <div
            className={classNames(
                "w-12 h-12 rounded-full flex items-center justify-center",
                bgClass,
            )}
        >
            <i className={classNames(icon, "text-xl", colorClass)}></i>
        </div>
    </div>
)

const FlowBar = ({
    entered,
    adopted,
    loading,
}: {
    entered: number
    adopted: number
    loading?: boolean
}) => {
    const max = Math.max(entered, adopted, 1)
    const enteredPct = (entered / max) * 100
    const adoptedPct = (adopted / max) * 100
    const diff = entered - adopted
    const diffColor =
        diff > 0
            ? "text-amber-600"
            : diff < 0
              ? "text-emerald-600"
              : "text-surface-500"
    const diffIcon = diff > 0 ? faArrowUp : diff < 0 ? faArrowDown : faMinus
    const diffLabel =
        diff > 0
            ? `+${diff} in attesa di adozione`
            : diff < 0
              ? `${Math.abs(diff)} adozioni in più degli ingressi`
              : "ingressi e adozioni in pareggio"

    return (
        <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <SectionTitle className="!mb-0">
                    Flusso Ingressi / Adozioni
                </SectionTitle>
                {loading ? (
                    <Skeleton width="6rem" height="1.5rem" />
                ) : (
                    <div
                        className={classNames(
                            "flex items-center gap-2 font-semibold text-sm",
                            diffColor,
                        )}
                    >
                        <FontAwesomeIcon icon={diffIcon} />
                        <span>{diffLabel}</span>
                    </div>
                )}
            </div>

            <div className="space-y-5">
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-surface-700">
                            Ingressi
                        </span>
                        {loading ? (
                            <Skeleton width="2rem" height="1rem" />
                        ) : (
                            <span className="font-bold text-amber-600">
                                {entered}
                            </span>
                        )}
                    </div>
                    <div className="h-4 bg-surface-100 rounded-full overflow-hidden">
                        {loading ? (
                            <Skeleton height="1rem" className="!rounded-full" />
                        ) : (
                            <div
                                className="h-full bg-amber-400 rounded-full transition-all duration-700"
                                style={{ width: `${enteredPct}%` }}
                            />
                        )}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-surface-700">
                            Adozioni
                        </span>
                        {loading ? (
                            <Skeleton width="2rem" height="1rem" />
                        ) : (
                            <span className="font-bold text-emerald-600">
                                {adopted}
                            </span>
                        )}
                    </div>
                    <div className="h-4 bg-surface-100 rounded-full overflow-hidden">
                        {loading ? (
                            <Skeleton height="1rem" className="!rounded-full" />
                        ) : (
                            <div
                                className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                                style={{ width: `${adoptedPct}%` }}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-6 mt-5 pt-4 border-t border-surface-100">
                <div className="flex items-center gap-2 text-xs text-surface-500">
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    Ingressi nel periodo
                </div>
                <div className="flex items-center gap-2 text-xs text-surface-500">
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    Adozioni nel periodo
                </div>
            </div>
        </div>
    )
}

const QuickActionButton = ({
    label,
    icon,
    onClick,
    description,
}: {
    label: string
    icon: any
    onClick: () => void
    description?: string
}) => (
    <div
        onClick={onClick}
        className="bg-white border border-surface-200 rounded-lg p-4 cursor-pointer hover:border-primary-400 hover:shadow-md transition-all group flex items-center gap-4"
    >
        <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
            <FontAwesomeIcon
                icon={icon}
                className="text-surface-500 group-hover:text-primary-600"
            />
        </div>
        <div>
            <div className="font-semibold text-surface-700 group-hover:text-primary-700">
                {label}
            </div>
            {description && (
                <div className="text-xs text-surface-500 mt-0.5">
                    {description}
                </div>
            )}
        </div>
        <FontAwesomeIcon
            icon={faArrowRight}
            className="ml-auto text-surface-300 group-hover:text-primary-400 opacity-0 group-hover:opacity-100 transition-all"
        />
    </div>
)

const PERIOD_PRESETS: { label: string; value: PeriodPreset }[] = [
    { label: "Questo mese", value: "this_month" },
    { label: "Mese scorso", value: "last_month" },
    { label: "Ultimi 3 mesi", value: "last_3_months" },
    { label: "Personalizzato", value: "custom" },
]

const getPresetDates = (preset: PeriodPreset): [Date, Date] => {
    const now = new Date()
    switch (preset) {
        case "this_month":
            return [startOfMonth(now), endOfMonth(now)]
        case "last_month": {
            const last = subMonths(now, 1)
            return [startOfMonth(last), endOfMonth(last)]
        }
        case "last_3_months":
            return [startOfMonth(subMonths(now, 2)), endOfMonth(now)]
        default:
            return [startOfMonth(now), endOfMonth(now)]
    }
}

const HomePage = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { data: races } = useRacesQuery()
    const { data: structures } = useStructuresQuery()
    const { data: recentAnimals, isLoading: recentLoading } =
        useRecentAnimalsQuery(5)

    const [preset, setPreset] = useState<PeriodPreset>("this_month")
    const [customRange, setCustomRange] = useState<[Date | null, Date | null]>([
        null,
        null,
    ])
    const [selectedStructureIds, setSelectedStructureIds] = useState<number[]>(
        [],
    )

    const [fromDate, toDate] = useMemo<[Date, Date]>(() => {
        if (preset === "custom" && customRange[0] && customRange[1]) {
            return [customRange[0], customRange[1]]
        }
        return getPresetDates(preset)
    }, [preset, customRange])

    const statsParams = useMemo(
        () => ({
            from_date: toISODate(fromDate),
            to_date: toISODate(toDate),
            structure_ids:
                selectedStructureIds.length > 0
                    ? selectedStructureIds
                    : undefined,
        }),
        [fromDate, toDate, selectedStructureIds],
    )

    const { data: stats, isLoading: statsLoading } =
        useAnimalStatsQuery(statsParams)

    const getRaceLabel = (raceId: string) => {
        const race = races?.find((r) => r.id === raceId)
        return race ? race.name : raceId
    }

    const animalNameTemplate = (rowData: AnimalSearchResult) => (
        <span
            className="font-medium text-primary-600 hover:text-primary-700 cursor-pointer hover:underline"
            onClick={() => navigate(`/animal/${rowData.id}/overview`)}
        >
            {rowData.name || "N/A"}
        </span>
    )

    const raceTemplate = (rowData: AnimalSearchResult) => (
        <span className="text-surface-600">
            {getRaceLabel(rowData.race_id)}
        </span>
    )

    const dateTemplate = (rowData: AnimalSearchResult) => (
        <span className="text-surface-600">
            {formatDate(rowData.entry_date)}
        </span>
    )

    const periodLabel =
        preset !== "custom"
            ? PERIOD_PRESETS.find((p) => p.value === preset)?.label
            : `${toISODate(fromDate)} – ${toISODate(toDate)}`

    return (
        <div className="space-y-8">
            <div>
                <PageTitle>Dashboard</PageTitle>
                <p className="text-surface-500 mt-1">
                    Benvenuto, {user?.username}. Ecco una panoramica del
                    rifugio.
                </p>
            </div>

            {/* Period & Structure Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-5">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex gap-2 flex-wrap">
                        {PERIOD_PRESETS.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setPreset(p.value)}
                                className={classNames(
                                    "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
                                    preset === p.value
                                        ? "bg-primary-600 text-white border-primary-600"
                                        : "bg-white text-surface-600 border-surface-300 hover:border-primary-400",
                                )}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {preset === "custom" && (
                        <Calendar
                            value={customRange}
                            onChange={(e) =>
                                setCustomRange(
                                    (e.value as [Date | null, Date | null]) ?? [
                                        null,
                                        null,
                                    ],
                                )
                            }
                            selectionMode="range"
                            dateFormat="dd/mm/yy"
                            placeholder="Seleziona periodo"
                            showIcon
                            className="text-sm"
                        />
                    )}

                    <div className="ml-auto">
                        <MultiSelect
                            value={selectedStructureIds}
                            onChange={(e) =>
                                setSelectedStructureIds(e.value ?? [])
                            }
                            options={(structures ?? []).map((s) => ({
                                label: s.name,
                                value: s.id,
                            }))}
                            placeholder="Tutte le strutture"
                            display="chip"
                            className="text-sm min-w-[200px]"
                            showClear
                        />
                    </div>
                </div>

                <div className="mt-3 text-xs text-surface-400">
                    Periodo: <span className="font-medium">{periodLabel}</span>
                    {selectedStructureIds.length > 0 && (
                        <>
                            {" · "}
                            {selectedStructureIds.length} struttura
                            {selectedStructureIds.length > 1 ? "e" : ""}{" "}
                            selezionata
                            {selectedStructureIds.length > 1 ? "e" : ""}
                        </>
                    )}
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Animali Totali"
                    value={stats?.total_animals ?? 0}
                    icon="pi pi-heart-fill"
                    colorClass="text-primary-600"
                    bgClass="bg-primary-50"
                    loading={statsLoading}
                    subtitle="nel periodo"
                />
                <StatCard
                    title="Animali Presenti"
                    value={stats?.present_animals ?? 0}
                    icon="pi pi-home"
                    colorClass="text-emerald-600"
                    bgClass="bg-emerald-50"
                    loading={statsLoading}
                    subtitle="attualmente in struttura"
                />
                <StatCard
                    title="Nuovi Ingressi"
                    value={stats?.entered_animals ?? 0}
                    icon="pi pi-arrow-circle-down"
                    colorClass="text-amber-600"
                    bgClass="bg-amber-50"
                    loading={statsLoading}
                    subtitle="nel periodo"
                />
                <StatCard
                    title="Adozioni"
                    value={stats?.adopted_animals ?? 0}
                    icon="pi pi-check-circle"
                    colorClass="text-blue-600"
                    bgClass="bg-blue-50"
                    loading={statsLoading}
                    subtitle="nel periodo"
                />
            </div>

            {/* Flow Chart */}
            <FlowBar
                entered={stats?.entered_animals ?? 0}
                adopted={stats?.adopted_animals ?? 0}
                loading={statsLoading}
            />

            {/* Therapy Reminders */}
            <TherapyRemindersCard />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Animals */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-surface-100 flex justify-between items-center">
                        <SectionTitle className="!mb-0">
                            Ultimi Ingressi
                        </SectionTitle>
                        <Button
                            label="Vedi Tutti"
                            icon="pi pi-arrow-right"
                            iconPos="right"
                            link
                            className="!p-0 text-primary-600 hover:text-primary-700"
                            onClick={() => navigate("/animal")}
                        />
                    </div>
                    <div className="p-0 flex-grow">
                        {recentLoading ? (
                            <div className="p-6 space-y-4">
                                {Array(5)
                                    .fill(0)
                                    .map((_, i) => (
                                        <Skeleton
                                            key={i}
                                            height="3rem"
                                            className="!rounded-lg"
                                        />
                                    ))}
                            </div>
                        ) : (
                            <DataTable
                                value={recentAnimals}
                                size="small"
                                className="w-full"
                                emptyMessage="Nessun animale trovato"
                                rowClassName={() =>
                                    "hover:bg-surface-50 transition-colors"
                                }
                                pt={{
                                    header: {
                                        className:
                                            "bg-surface-50 text-surface-600 font-medium text-sm",
                                    },
                                    thead: { className: "bg-surface-50" },
                                    bodyRow: {
                                        className:
                                            "border-b border-surface-100 last:border-0",
                                    },
                                }}
                            >
                                <Column
                                    field="name"
                                    header="Nome"
                                    body={animalNameTemplate}
                                    className="py-3 px-6"
                                />
                                <Column
                                    field="race_id"
                                    header="Specie"
                                    body={raceTemplate}
                                    className="py-3 px-6"
                                />
                                <Column
                                    field="rescue_city"
                                    header="Città di Ritrovamento"
                                    className="py-3 px-6 text-surface-600"
                                />
                                <Column
                                    field="entry_date"
                                    header="Data Ingresso"
                                    body={dateTemplate}
                                    className="py-3 px-6"
                                />
                                <Column
                                    field="entry_type"
                                    header="Tipo Ingresso"
                                    className="py-3 px-6 text-surface-600"
                                />
                            </DataTable>
                        )}
                    </div>
                </div>

                {/* Right Column: Utilities */}
                <div className="space-y-8">
                    <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
                        <SectionTitle>Utilità e Report</SectionTitle>
                        <div className="grid grid-cols-1 gap-3 mt-4">
                            <QuickActionButton
                                label="Report Ingressi"
                                description="Scarica elenco ingressi"
                                icon={faDownload}
                                onClick={() => navigate("/exports")}
                            />
                            <QuickActionButton
                                label="Report Uscite"
                                description="Scarica elenco uscite"
                                icon={faUpload}
                                onClick={() => navigate("/exports")}
                            />
                            <QuickActionButton
                                label="Statistiche"
                                description="Visualizza grafici"
                                icon={faChartBar}
                                onClick={() => navigate("/exports")}
                            />
                            <QuickActionButton
                                label="Backup Dati"
                                description="Esporta database"
                                icon={faDatabase}
                                onClick={() => navigate("/exports")}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage
