import { useQuery } from "react-query"
import { useParams } from "react-router-dom"
import { Animal } from "../models/animal.schema"
import AnimalDossier from "../components/animal/AnimalDossier"

const data: Animal = {
    name: "Gino",
    code: "CB1802023112000",
    race_id: "C",
    entry_type: "R",
    rescue_city: "Roma",
    rescue_province: "RM",
    entry_date: new Date("2023-11-21"),
    adoptability_index: 0,
    stage: "S",
}

const AnimalProfilePage = () => {
    const { code } = useParams()
    const animalQuery = useQuery(
        ["animal", code],
        () => new Promise<Animal>((resolve) => resolve(data)) // apiService.getAnimal(props.code)
    )

    return (
        <div>
            {animalQuery.data && <AnimalDossier data={animalQuery.data} />}
        </div>
    )
}

export default AnimalProfilePage
