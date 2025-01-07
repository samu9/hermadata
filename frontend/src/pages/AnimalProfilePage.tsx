import { useParams } from "react-router-dom"
import AnimalRecord from "../components/animal/AnimalRecord"
import Toolbar from "../components/Toolbar"
import { ToolbarProvider } from "../contexts/Toolbar"
import { useAnimalQuery } from "../queries"

const AnimalProfilePage = () => {
    const { id } = useParams()
    const animalQuery = useAnimalQuery(id!)

    return (
        <ToolbarProvider>
            <div>
                {animalQuery.data && (
                    <div>
                        <AnimalRecord data={animalQuery.data} />
                    </div>
                )}
                <Toolbar />
            </div>
        </ToolbarProvider>
    )
}

export default AnimalProfilePage
