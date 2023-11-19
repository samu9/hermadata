import { useQuery } from "react-query"
import { apiService } from "../main"

type Props = {
    code: string
}

const AnimalDossier = (props: Props) => {
    const animalQuery = useQuery(["animal", props.code], () =>
        apiService.getAnimal(props.code)
    )
    return <div></div>
}

export default AnimalDossier
