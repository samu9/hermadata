import { PageTitle } from "../components/typography"
import NewVetButton from "../components/vet/NewVetButton"
import VetList from "../components/vet/VetList"

const VetsPage = () => {
    return (
        <div>
            <PageTitle>Veterinari</PageTitle>
            <VetList />
            <NewVetButton />
        </div>
    )
}

export default VetsPage
