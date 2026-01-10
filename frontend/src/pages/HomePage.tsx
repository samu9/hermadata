/**
 * HomePage Component - Animal Shelter Management Dashboard
 *
 * Features:
 * - Statistics overview (total animals, active animals, adoptions)
 * - Quick action buttons for common tasks
 * - Recent animals table with navigation links
 * - Important dates and reminders section
 * - Report and utility shortcuts
 * - Role-based access control for admin features
 */

import { Button } from "primereact/button"
import { Badge } from "primereact/badge"
import { Skeleton } from "primereact/skeleton"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { useNavigate } from "react-router-dom"
import { PageTitle, SectionTitle } from "../components/typography"
import {
    useDashboardStatsQuery,
    useRecentAnimalsQuery,
    useRacesQuery,
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
} from "@fortawesome/free-solid-svg-icons"

const HomePage = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { data: stats, isLoading: statsLoading } = useDashboardStatsQuery()
    const { data: recentAnimals, isLoading: recentLoading } =
        useRecentAnimalsQuery(5)
    const { data: races } = useRacesQuery()

    const getRaceLabel = (raceId: string) => {
        const race = races?.find((r) => r.id === raceId)
        return race ? race.name : raceId
    }

    const formatDate = (date: Date | null) => {
        if (!date) return "N/A"
        return new Date(date).toLocaleDateString("it-IT")
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

    const StatCard = ({
        title,
        value,
        icon,
        colorClass,
        bgClass,
        loading,
    }: {
        title: string
        value: number | string
        icon: string
        colorClass: string
        bgClass: string
        loading?: boolean
    }) => (
        <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6 flex items-center justify-between transition-transform hover:-translate-y-1 duration-200">
            <div>
                <div className="text-surface-500 font-medium text-sm uppercase tracking-wide mb-2">
                    {title}
                </div>
                {loading ? (
                    <Skeleton width="4rem" height="2rem" />
                ) : (
                    <div
                        className={classNames("text-3xl font-bold", colorClass)}
                    >
                        {value}
                    </div>
                )}
            </div>
            <div
                className={classNames(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    bgClass
                )}
            >
                <i className={classNames(icon, "text-xl", colorClass)}></i>
            </div>
        </div>
    )

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

    return (
        <div className="space-y-8">
            <div>
                <PageTitle>Dashboard</PageTitle>
                <p className="text-surface-500 mt-1">
                    Benvenuto, {user?.username}. Ecco una panoramica del
                    rifugio.
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Animali Totali"
                    value={stats?.totalAnimals || 0}
                    icon="pi pi-heart-fill"
                    colorClass="text-primary-600"
                    bgClass="bg-primary-50"
                    loading={statsLoading}
                />
                <StatCard
                    title="Animali Presenti"
                    value={stats?.activeAnimals || 0}
                    icon="pi pi-home"
                    colorClass="text-emerald-600"
                    bgClass="bg-emerald-50"
                    loading={statsLoading}
                />
                <StatCard
                    title="Animali Adottati"
                    value={stats?.adoptedAnimals || 0}
                    icon="pi pi-check-circle"
                    colorClass="text-blue-600"
                    bgClass="bg-blue-50"
                    loading={statsLoading}
                />
                <StatCard
                    title="Nuovi Ingressi (30gg)"
                    value={stats?.recentEntries || 0}
                    icon="pi pi-arrow-circle-down"
                    colorClass="text-amber-600"
                    bgClass="bg-amber-50"
                    loading={statsLoading}
                />
            </div>

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

                {/* Right Column: Utilities & Reminders */}
                <div className="space-y-8">
                    {/* Utilities */}
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

                    {/* Important Dates (Superuser only) */}
                    {user?.is_superuser && (
                        <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
                            <SectionTitle>Date Importanti</SectionTitle>
                            <div className="space-y-3 mt-4">
                                <div className="flex justify-between items-center p-3 bg-surface-50 rounded-lg border border-surface-100">
                                    <div>
                                        <div className="font-medium text-surface-700">
                                            Controlli Veterinari
                                        </div>
                                        <div className="text-surface-500 text-xs">
                                            Prossimi appuntamenti
                                        </div>
                                    </div>
                                    <Badge
                                        value="0"
                                        severity="warning"
                                        className="!bg-amber-100 !text-amber-700"
                                    />
                                </div>
                                <div className="flex justify-between items-center p-3 bg-surface-50 rounded-lg border border-surface-100">
                                    <div>
                                        <div className="font-medium text-surface-700">
                                            Vaccinazioni
                                        </div>
                                        <div className="text-surface-500 text-xs">
                                            In scadenza
                                        </div>
                                    </div>
                                    <Badge
                                        value="0"
                                        severity="info"
                                        className="!bg-blue-100 !text-blue-700"
                                    />
                                </div>
                                <div className="flex justify-between items-center p-3 bg-surface-50 rounded-lg border border-surface-100">
                                    <div>
                                        <div className="font-medium text-surface-700">
                                            Sterilizzazioni
                                        </div>
                                        <div className="text-surface-500 text-xs">
                                            Da programmare
                                        </div>
                                    </div>
                                    <Badge
                                        value="0"
                                        severity="success"
                                        className="!bg-emerald-100 !text-emerald-700"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HomePage
