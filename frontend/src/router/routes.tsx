import { RouteObject } from "react-router-dom"
import App from "../App"
import HomePage from "../pages/HomePage"
import AnimalsPage from "../pages/AnimalsPage"
import AnimalProfilePage from "../pages/AnimalProfilePage"
import AnimalDocs from "../components/animal/AnimalDocs"
import AnimalEvents from "../components/animal/AnimalEvents"
import AnimalOverview from "../components/animal/AnimalOverview"
import AnimalEditForm from "../components/animal/AnimalEditForm"
import NewAdopterForm from "../components/adopter/NewAdopterForm"
import AnimalAdoptionPage from "../pages/AnimalAdoptionPage"
import AnimalExitForm from "../components/animal/AnimalExitForm"

const routes: RouteObject[] = [
    {
        path: "/",
        element: <App />,
        children: [
            { path: "", element: <HomePage /> },
            {
                path: "animal",
                element: <AnimalsPage />,
                children: [],
            },
            {
                path: "animal/:id/adoption",
                element: <AnimalAdoptionPage />,
            },
            {
                path: "animal/:id",
                element: <AnimalProfilePage />,
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
                        path: "exit",
                        element: <AnimalExitForm />,
                    },
                ],
            },
            {
                path: "adopters",
                element: <NewAdopterForm />,
            },
        ],
    },
]

export default routes
