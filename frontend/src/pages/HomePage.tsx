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

import { Card } from "primereact/card"
import { Button } from "primereact/button"
import { Badge } from "primereact/badge"
import { Skeleton } from "primereact/skeleton"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { useNavigate } from "react-router-dom"
import { PageTitle } from "../components/typography"
import {
    useDashboardStatsQuery,
    useRecentAnimalsQuery,
    useRacesQuery,
} from "../queries"
import { useAuth } from "../contexts/AuthContext"
import { AnimalSearchResult } from "../models/animal.schema"

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

    const animalCodeTemplate = (rowData: AnimalSearchResult) => (
        <Button
            label={rowData.code}
            link
            className="p-0"
            onClick={() => navigate(`/animal/${rowData.code}/overview`)}
        />
    )

    const raceTemplate = (rowData: AnimalSearchResult) => (
        <span>{getRaceLabel(rowData.race_id)}</span>
    )

    const dateTemplate = (rowData: AnimalSearchResult) => (
        <span>{formatDate(rowData.entry_date)}</span>
    )

    const StatCard = ({
        title,
        value,
        icon,
        color,
        loading,
    }: {
        title: string
        value: number | string
        icon: string
        color: string
        loading?: boolean
    }) => (
        <Card className="shadow-2 h-full">
            <div className="flex justify-content-between align-items-center">
                <div>
                    <div className="text-600 font-medium mb-2">{title}</div>
                    {loading ? (
                        <Skeleton width="4rem" height="2rem" />
                    ) : (
                        <div className={`text-3xl font-bold ${color}`}>
                            {value}
                        </div>
                    )}
                </div>
                <div className={`p-3 border-round ${color} bg-primary-100`}>
                    <i className={`${icon} text-2xl`}></i>
                </div>
            </div>
        </Card>
    )

    const QuickActionButton = ({
        label,
        icon,
        onClick,
        color = "p-button-outlined",
    }: {
        label: string
        icon: string
        onClick: () => void
        color?: string
    }) => (
        <Button
            label={label}
            icon={icon}
            onClick={onClick}
            className={`w-full ${color}`}
        />
    )

    return (
        <div className="p-4">
            <div className="mb-5">
                <PageTitle>Dashboard</PageTitle>
            </div>

            {/* Statistics Cards */}
            <div className="flex gap-2 mb-4 w-full">
                <div className="col-12 md:col-6 lg:col-3 mb-3 lg:mb-0">
                    <StatCard
                        title="Animali Totali"
                        value={stats?.totalAnimals || 0}
                        icon="pi pi-heart-fill"
                        color="text-primary"
                        loading={statsLoading}
                    />
                </div>
                <div className="col-12 md:col-6 lg:col-3 mb-3 lg:mb-0">
                    <StatCard
                        title="Animali Presenti"
                        value={stats?.activeAnimals || 0}
                        icon="pi pi-home"
                        color="text-green-500"
                        loading={statsLoading}
                    />
                </div>
                <div className="col-12 md:col-6 lg:col-3 mb-3 md:mb-0">
                    <StatCard
                        title="Animali Adottati"
                        value={stats?.adoptedAnimals || 0}
                        icon="pi pi-check-circle"
                        color="text-blue-500"
                        loading={statsLoading}
                    />
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <StatCard
                        title="Nuovi Ingressi (30gg)"
                        value={stats?.recentEntries || 0}
                        icon="pi pi-arrow-circle-down"
                        color="text-orange-500"
                        loading={statsLoading}
                    />
                </div>
            </div>

            <div className="grid">
                {/* <div className="col-12 lg:col-4">
                    <Card title="Azioni Rapide" className="h-full">
                        <div className="flex flex-column gap-3">
                            <QuickActionButton
                                label="Nuovo Ingresso"
                                icon="pi pi-plus"
                                onClick={() => navigate("/animal")}
                                color="p-button-success"
                            />
                            <QuickActionButton
                                label="Cerca Animali"
                                icon="pi pi-search"
                                onClick={() => navigate("/animal")}
                            />
                            <QuickActionButton
                                label="Gestisci Adozioni"
                                icon="pi pi-users"
                                onClick={() => navigate("/adopters")}
                            />
                            <QuickActionButton
                                label="Veterinari"
                                icon="pi pi-briefcase"
                                onClick={() => navigate("/vets")}
                            />
                            {hasPermission && hasPermission("superuser") && (
                                <QuickActionButton
                                    label="Amministrazione"
                                    icon="pi pi-cog"
                                    onClick={() => navigate("/admin")}
                                    color="p-button-warning"
                                />
                            )}
                        </div>
                    </Card>
                </div> */}

                {/* Recent Animals */}
                <div className="col-12 lg:col-8">
                    <Card title="Ultimi Ingressi" className="h-full">
                        {recentLoading ? (
                            <div className="flex flex-column gap-2">
                                {Array(5)
                                    .fill(0)
                                    .map((_, i) => (
                                        <Skeleton key={i} height="2rem" />
                                    ))}
                            </div>
                        ) : (
                            <DataTable
                                value={recentAnimals}
                                size="small"
                                className="p-datatable-sm"
                                emptyMessage="Nessun animale trovato"
                            >
                                <Column
                                    field="code"
                                    header="Codice"
                                    body={animalCodeTemplate}
                                />
                                <Column
                                    field="name"
                                    header="Nome"
                                    body={(rowData) => rowData.name || "N/A"}
                                />
                                <Column
                                    field="race_id"
                                    header="Specie"
                                    body={raceTemplate}
                                />
                                <Column
                                    field="rescue_city"
                                    header="Città di Ritrovamento"
                                />
                                <Column
                                    field="entry_date"
                                    header="Data Ingresso"
                                    body={dateTemplate}
                                />
                                <Column
                                    field="entry_type"
                                    header="Tipo Ingresso"
                                />
                            </DataTable>
                        )}
                        <div className="mt-3 text-right">
                            <Button
                                label="Vedi Tutti"
                                icon="pi pi-arrow-right"
                                iconPos="right"
                                link
                                onClick={() => navigate("/animal")}
                            />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Important Dates and Reminders */}
            <div className="grid mt-4">
                {user?.is_superuser && (
                    <div className="col-12 lg:col-6">
                        <Card title="Date Importanti">
                            <div className="flex flex-column gap-3">
                                <div className="flex justify-content-between align-items-center p-3 border-1 border-200 border-round">
                                    <div>
                                        <div className="font-medium">
                                            Controlli Veterinari
                                        </div>
                                        <div className="text-600 text-sm">
                                            Prossimi appuntamenti programmati
                                        </div>
                                    </div>
                                    <Badge value="0" severity="warning" />
                                </div>
                                <div className="flex justify-content-between align-items-center p-3 border-1 border-200 border-round">
                                    <div>
                                        <div className="font-medium">
                                            Vaccinazioni
                                        </div>
                                        <div className="text-600 text-sm">
                                            Animali che necessitano vaccinazioni
                                        </div>
                                    </div>
                                    <Badge value="0" severity="info" />
                                </div>
                                <div className="flex justify-content-between align-items-center p-3 border-1 border-200 border-round">
                                    <div>
                                        <div className="font-medium">
                                            Sterilizzazioni
                                        </div>
                                        <div className="text-600 text-sm">
                                            Appuntamenti per sterilizzazione
                                        </div>
                                    </div>
                                    <Badge value="0" severity="success" />
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                <div className="col-12 lg:col-6">
                    <Card title="Utilità e Report">
                        <div className="flex flex-column gap-3">
                            <QuickActionButton
                                label="Report Ingressi"
                                icon="pi pi-download"
                                onClick={() => navigate("/exports")}
                            />
                            <QuickActionButton
                                label="Report Uscite"
                                icon="pi pi-upload"
                                onClick={() => navigate("/exports")}
                            />
                            <QuickActionButton
                                label="Statistiche Dettagliate"
                                icon="pi pi-chart-bar"
                                onClick={() => navigate("/exports")}
                            />
                            <QuickActionButton
                                label="Backup Dati"
                                icon="pi pi-database"
                                onClick={() => navigate("/exports")}
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default HomePage
