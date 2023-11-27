import { RouteObject } from "react-router-dom"
import App from "../App"
import HomePage from "../pages/HomePage"
import AnimalsPage from "../pages/AnimalsPage"
import AnimalProfilePage from "../pages/AnimalProfilePage"
import AnimalDocs from "../components/animal/AnimalDocs"
import AnimalEvents from "../components/animal/AnimalEvents"
import AnimalOverview from "../components/animal/AnimalOverview"
import AnimalEditForm from "../components/animal/AnimalEditForm"

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
                path: "animal/:id",
                element: <AnimalProfilePage />,
                children: [
                    { path: "", element: <AnimalOverview /> },
                    { path: "docs", element: <AnimalDocs /> },
                    { path: "events", element: <AnimalEvents /> },
                    { path: "edit", element: <AnimalEditForm /> },
                ],
            },
        ],
    },
]

export default routes
