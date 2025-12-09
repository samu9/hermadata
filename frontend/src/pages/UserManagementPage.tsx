import React, { useState } from "react"
import { TabView, TabPanel } from "primereact/tabview"
import { usePermissions } from "../hooks/usePermissions"
import UserList from "../components/user/UserList"
import CreateUserForm from "../components/user/CreateUserForm"
import UserActivities from "../components/user/UserActivities"
import { PageTitle } from "../components/typography"

const UserManagementPage: React.FC = () => {
    const { user } = usePermissions()
    const [activeTab, setActiveTab] = useState(0)

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <PageTitle>Gestione Utenti</PageTitle>
                    <p className="text-surface-600 mt-2">
                        Amministra gli utenti del sistema e le loro
                        autorizzazioni
                    </p>
                </div>
                <div className="text-sm text-surface-500 bg-surface-100 px-3 py-1 rounded-full">
                    Admin:{" "}
                    <span className="font-medium text-surface-900">
                        {user?.username}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden">
                <TabView
                    activeIndex={activeTab}
                    onTabChange={(e) => setActiveTab(e.index)}
                    className="p-0"
                    pt={{
                        nav: {
                            className:
                                "bg-surface-50 border-b border-surface-200",
                        },
                        navContent: { className: "bg-transparent" },
                        panelContainer: { className: "p-6" },
                    }}
                >
                    <TabPanel header="Lista Utenti" leftIcon="pi pi-users mr-2">
                        <UserList />
                    </TabPanel>

                    <TabPanel
                        header="Crea Utente"
                        leftIcon="pi pi-user-plus mr-2"
                    >
                        <div className="max-w-2xl">
                            <CreateUserForm
                                onUserCreated={() => setActiveTab(0)}
                            />
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
        </div>
    )
}

export default UserManagementPage
