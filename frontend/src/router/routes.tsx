import { Outlet, RouteObject, UIMatch } from "react-router-dom"
import App from "../App"
import NewAdopterForm from "../components/adopter/NewAdopterForm"
import AnimalDocs from "../components/animal/AnimalDocs"
import AnimalEditForm from "../components/animal/AnimalEditForm"
import AnimalEvents from "../components/animal/AnimalEvents"
import AnimalExitForm from "../components/animal/AnimalExitForm"
import AnimalOverview from "../components/animal/AnimalOverview"
import AnimalAdoptionPage from "../pages/AnimalAdoptionPage"
import AnimalProfilePage from "../pages/AnimalProfilePage"
import AnimalsPage from "../pages/AnimalsPage"
import HomePage from "../pages/HomePage"
import DataExtractionsPage from "../pages/DataExtractionsPage"
import AdoptersPage from "../pages/AdoptersPage"

const routes: RouteObject[] = [
    {
        path: "/",
        element: <App />,
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
                            { path: "edit", element: <AnimalEditForm /> },
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
                path: "exports",
                element: <DataExtractionsPage />,
            },
        ],
    },
]

export default routes
