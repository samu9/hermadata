import { RouteObject } from "react-router-dom"
import App from "../App"
import HomePage from "../pages/HomePage"
import AnimalsPage from "../pages/AnimalsPage"
import AnimalProfilePage from "../pages/AnimalProfilePage"
import AnimalDocs from "../components/animal/AnimalDocs"
import AnimalEvents from "../components/animal/AnimalEvents"
import AnimalOverview from "../components/animal/AnimalOverview"

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
                path: "animal/:code",
                element: <AnimalProfilePage />,
                children: [
                    { path: "", element: <AnimalOverview /> },
                    { path: "docs", element: <AnimalDocs /> },
                    { path: "events", element: <AnimalEvents /> },
                ],
            },
        ],
    },
]

export default routes
