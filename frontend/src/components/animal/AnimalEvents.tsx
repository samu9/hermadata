import { useParams } from "react-router-dom"

const AnimalEvents = () => {
    const { code } = useParams()

    return <div>{code}</div>
}

export default AnimalEvents
