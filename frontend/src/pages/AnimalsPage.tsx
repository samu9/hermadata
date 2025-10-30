import AnimalList from "../components/animal/AnimalList"
import { PageTitle } from "../components/typography"
import NewEntry from "../components/new-entry/NewEntry"
import { useAuth } from "../contexts/AuthContext"
import { Permission } from "../constants"

const AnimalsPage = () => {
    const { can } = useAuth()
    return (
        <div>
            <PageTitle>Animali</PageTitle>
            <AnimalList />
            {can(Permission.CREATE_ANIMAL) && <NewEntry />}
        </div>
    )
}

export default AnimalsPage
