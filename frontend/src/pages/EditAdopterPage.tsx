import { Button } from "primereact/button"
import { ProgressSpinner } from "primereact/progressspinner"
import { useNavigate, useParams } from "react-router-dom"
import EditAdopterForm from "../components/adopter/EditAdopterForm"
import { PageTitle } from "../components/typography"
import { useAdopterQuery } from "../queries"

const EditAdopterPage = () => {
    const { id } = useParams()
    const adopterId = id ? parseInt(id, 10) : undefined
    const adopterQuery = useAdopterQuery(adopterId)
    const navigate = useNavigate()

    return (
        <div>
            <div className="flex items-center gap-3 mb-4">
                <Button
                    icon="pi pi-arrow-left"
                    text
                    rounded
                    aria-label="Torna agli adottanti"
                    onClick={() => navigate("/adopters")}
                />
                <PageTitle>Modifica adottante</PageTitle>
            </div>
            {adopterQuery.isLoading || !adopterQuery.data ? (
                <div className="flex justify-center py-16">
                    <ProgressSpinner />
                </div>
            ) : (
                <EditAdopterForm adopter={adopterQuery.data} />
            )}
        </div>
    )
}

export default EditAdopterPage
