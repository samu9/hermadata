import AnimalList from "../components/animal/AnimalList"
import { PageTitle } from "../components/typography"
import NewEntry from "../components/new-entry/NewEntry"

const AnimalsPage = () => {
    return (
        <div>
            <PageTitle>Animali</PageTitle>
            <AnimalList />
            <NewEntry />
        </div>
    )
}

export default AnimalsPage
