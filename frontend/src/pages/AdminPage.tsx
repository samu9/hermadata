import React from "react"
import { Card } from "primereact/card"
import { Button } from "primereact/button"
import { usePermissions } from "../hooks/usePermissions"

const AdminPage: React.FC = () => {
    const { user } = usePermissions()

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Pannello Amministrazione</h1>
            <p className="mb-4">Benvenuto, {user?.username}! Questa pagina è accessibile solo ai super utenti.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card title="Gestione Utenti" className="mb-4">
                    <p className="mb-3">Gestisci gli utenti del sistema</p>
                    <Button label="Gestisci Utenti" severity="info" />
                </Card>
                
                <Card title="Configurazioni Sistema" className="mb-4">
                    <p className="mb-3">Modifica le configurazioni del sistema</p>
                    <Button label="Configurazioni" severity="warning" />
                </Card>
                
                <Card title="Log di Sistema" className="mb-4">
                    <p className="mb-3">Visualizza i log del sistema</p>
                    <Button label="Visualizza Log" severity="secondary" />
                </Card>
                
                <Card title="Backup Database" className="mb-4">
                    <p className="mb-3">Crea backup del database</p>
                    <Button label="Crea Backup" severity="danger" />
                </Card>
            </div>
        </div>
    )
}

export default AdminPage