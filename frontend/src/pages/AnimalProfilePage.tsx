import { useQuery } from "react-query"
import { useParams } from "react-router-dom"
import { Animal } from "../models/animal.schema"
import AnimalRecord from "../components/animal/AnimalRecord"
import { apiService } from "../main"

const AnimalProfilePage = () => {
    const { id } = useParams()
    const animalQuery = useQuery(["animal", id], () =>
        apiService.getAnimal(id!)
    )

    return (
        <div>
            {animalQuery.data && <AnimalRecord data={animalQuery.data} />}
        </div>
    )
}

export default AnimalProfilePage
