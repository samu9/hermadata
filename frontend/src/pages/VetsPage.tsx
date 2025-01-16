import NewItemButton from "../components/NewItemButton"
import { PageTitle } from "../components/typography"
import NewVetForm from "../components/vet/NewVetForm"
import VetList from "../components/vet/VetList"

const VetsPage = () => {
    return (
        <div>
            <PageTitle>Veterinari</PageTitle>
            <VetList />
            <NewItemButton
                label="Nuovo veterinario"
                successLabel="Nuovo veterinario"
                formComponent={<NewVetForm />}
            />
        </div>
    )
}

export default VetsPage
