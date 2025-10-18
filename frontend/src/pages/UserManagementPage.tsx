import React, { useState } from "react"
import { Card } from "primereact/card"
import { Button } from "primereact/button"
import { TabView, TabPanel } from "primereact/tabview"
import { usePermissions } from "../hooks/usePermissions"
import UserList from "../components/user/UserList"
import CreateUserForm from "../components/user/CreateUserForm"
import UserActivities from "../components/user/UserActivities"

const UserManagementPage: React.FC = () => {
    const { user } = usePermissions()
    const [activeTab, setActiveTab] = useState(0)

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Gestione Utenti
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Amministra gli utenti del sistema e le loro
                        autorizzazioni
                    </p>
                </div>
                <div className="text-sm text-gray-500">
                    Admin: {user?.username}
                </div>
            </div>

            <TabView
                activeIndex={activeTab}
                onTabChange={(e) => setActiveTab(e.index)}
                className="bg-white rounded-lg shadow"
            >
                <TabPanel header="Lista Utenti" leftIcon="pi pi-users mr-2">
                    <UserList />
                </TabPanel>

                <TabPanel header="Crea Utente" leftIcon="pi pi-user-plus mr-2">
                    <div className="max-w-2xl">
                        <CreateUserForm onUserCreated={() => setActiveTab(0)} />
                    </div>
                </TabPanel>

                <TabPanel
                    header="Attività Recenti"
                    leftIcon="pi pi-history mr-2"
                >
                    <UserActivities />
                </TabPanel>
            </TabView>
        </div>
    )
}

export default UserManagementPage
