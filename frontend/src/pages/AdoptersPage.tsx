import AdopterList from "../components/adopter/AdopterList"
import NewAdopterButton from "../components/adopter/NewAdopterButton"
import { PageTitle } from "../components/typography"

const AdoptersPage = () => {
    return (
        <div>
            <PageTitle>Adottanti</PageTitle>
            <AdopterList />
            <NewAdopterButton />
        </div>
    )
}

export default AdoptersPage
