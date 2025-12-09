import React from "react"
import { Button } from "primereact/button"
import { Link } from "react-router-dom"
import { usePermissions } from "../hooks/usePermissions"
import { PageTitle } from "../components/typography"

const AdminPage: React.FC = () => {
    const { user } = usePermissions()

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <PageTitle>Pannello Amministrazione</PageTitle>
                <p className="text-surface-600 mt-2">
                    Benvenuto, {user?.username}! Questa pagina è accessibile
                    solo ai super utenti.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6 flex flex-col h-full">
                    <h3 className="text-lg font-semibold text-surface-900 mb-2">
                        Gestione Utenti
                    </h3>
                    <p className="text-surface-600 mb-6 flex-grow">
                        Gestisci gli utenti del sistema, i loro ruoli e
                        permessi.
                    </p>
                    <Link to="/admin/users">
                        <Button
                            label="Gestisci Utenti"
                            className="w-full !bg-primary-600 !border-primary-600 hover:!bg-primary-700"
                        />
                    </Link>
                </div>

                {/* <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6 flex flex-col h-full">
                    <h3 className="text-lg font-semibold text-surface-900 mb-2">Configurazioni Sistema</h3>
                    <p className="text-surface-600 mb-6 flex-grow">
                        Modifica le configurazioni del sistema
                    </p>
                    <Button label="Configurazioni" severity="warning" className="w-full" />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6 flex flex-col h-full">
                    <h3 className="text-lg font-semibold text-surface-900 mb-2">Log di Sistema</h3>
                    <p className="text-surface-600 mb-6 flex-grow">Visualizza i log del sistema</p>
                    <Button label="Visualizza Log" severity="secondary" className="w-full" />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6 flex flex-col h-full">
                    <h3 className="text-lg font-semibold text-surface-900 mb-2">Backup Database</h3>
                    <p className="text-surface-600 mb-6 flex-grow">Crea backup del database</p>
                    <Button label="Crea Backup" severity="danger" className="w-full" />
                </div> */}
            </div>
        </div>
    )
}

export default AdminPage
