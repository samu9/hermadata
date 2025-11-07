import { Outlet, RouteObject, UIMatch } from "react-router-dom"
import App from "../App"
import AnimalDocs from "../components/animal/AnimalDocs"
import AnimalEditFormWrapper from "../components/animal/AnimalEditFormWrapper"
import AnimalEvents from "../components/animal/AnimalEvents"
import AnimalExitForm from "../components/animal/AnimalExitForm"
import AnimalOverview from "../components/animal/AnimalOverview"
import ProtectedRoute from "../components/ProtectedRoute"
import RoleProtectedRoute from "../components/RoleProtectedRoute"
import AdoptersPage from "../pages/AdoptersPage"
import AdminPage from "../pages/AdminPage"
import AnimalAdoptionPage from "../pages/AnimalAdoptionPage"
import AnimalProfilePage from "../pages/AnimalProfilePage"
import AnimalsPage from "../pages/AnimalsPage"
import DataExtractionsPage from "../pages/DataExtractionsPage"
import HomePage from "../pages/HomePage"
import LoginPage from "../pages/LoginPage"
import NotFoundPage from "../pages/NotFoundPage"
import ProfilePage from "../pages/ProfilePage"
import UserManagementPage from "../pages/UserManagementPage"
import VetsPage from "../pages/VetsPage"

const routes: RouteObject[] = [
    // Public routes
    {
        path: "/login",
        element: <LoginPage />,
    },
    // Protected routes
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <App />
            </ProtectedRoute>
        ),
        children: [
            { path: "", element: <HomePage /> },
            {
                path: "animal",
                element: <Outlet />,
                children: [
                    {
                        element: <AnimalsPage />,
                        index: true,
                    },
                    {
                        path: ":id",
                        element: <AnimalProfilePage />,
                        handle: {
                            crumb: (data: UIMatch) => data.params["id"],
                        },
                        children: [
                            {
                                path: "overview",
                                index: true,
                                element: <AnimalOverview />,
                            },
                            { path: "docs", element: <AnimalDocs /> },
                            { path: "events", element: <AnimalEvents /> },
                            {
                                path: "edit",
                                element: <AnimalEditFormWrapper />,
                            },
                            {
                                path: "health",
                                element: <div>IN COSTRUZIONE</div>,
                            },
                            {
                                path: "exit",
                                element: <AnimalExitForm />,
                            },
                        ],
                    },
                    {
                        path: ":id/adoption",
                        element: <AnimalAdoptionPage />,
                    },
                ],
                handle: {
                    crumb: () => "Animali",
                },
            },
            {
                path: "adopters",
                element: <AdoptersPage />,
            },
            {
                path: "vets",
                element: <VetsPage />,
            },
            {
                path: "profile",
                element: <ProfilePage />,
            },
            {
                path: "exports",
                element: <DataExtractionsPage />,
            },
            // Super user only routes
            {
                path: "admin",
                element: (
                    <RoleProtectedRoute requiredRole="superuser">
                        <Outlet />
                    </RoleProtectedRoute>
                ),
                children: [
                    {
                        index: true,
                        element: <AdminPage />,
                    },
                    {
                        path: "users",
                        element: <UserManagementPage />,
                        handle: {
                            crumb: () => "Gestione Utenti",
                        },
                    },
                ],
                handle: {
                    crumb: () => "Amministrazione",
                },
            },
            // Catch-all route for 404 - inside protected routes
            {
                path: "*",
                element: <NotFoundPage />,
            },
        ],
    },
]

export default routes
