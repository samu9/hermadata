import { useParams } from "react-router-dom"
import AnimalRecord from "../components/animal/AnimalRecord"
import { useAnimalQuery } from "../queries"
import NewEntry from "../components/new-entry/NewEntry"

const AnimalProfilePage = () => {
    const { id } = useParams()
    const animalQuery = useAnimalQuery(id!)

    return (
        <div>
            {animalQuery.data && (
                <div>
                    <AnimalRecord data={animalQuery.data} />
                    {animalQuery.data.exit_date && <NewEntry animalId={id} />}
                </div>
            )}
        </div>
    )
}

export default AnimalProfilePage
