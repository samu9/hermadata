import { useParams } from "react-router-dom"
import AnimalRecord from "../components/animal/AnimalRecord"
import { useAnimalQuery } from "../queries"

const AnimalProfilePage = () => {
    const { id } = useParams()
    const animalQuery = useAnimalQuery(id!)

    return (
        <div>
            {animalQuery.data && <AnimalRecord data={animalQuery.data} />}
        </div>
    )
}

export default AnimalProfilePage
