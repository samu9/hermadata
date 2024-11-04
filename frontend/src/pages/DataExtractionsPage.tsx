import AnimalDaysForm from "../components/AnimalDaysForm"
import AnimalEntriesForm from "../components/AnimalEntriesForm"
import AnimalExitsForm from "../components/AnimalExitsForm"

const DataExtractionsPage = () => {
    return (
        <div className="flex flex-col gap-5">
            <AnimalDaysForm />
            <AnimalEntriesForm />
            <AnimalExitsForm />
        </div>
    )
}

export default DataExtractionsPage
