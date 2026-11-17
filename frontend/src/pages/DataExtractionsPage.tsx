import AnimalDaysForm from "../components/AnimalDaysForm"
import AnimalEntriesForm from "../components/AnimalEntriesForm"
import AnimalExitsForm from "../components/AnimalExitsForm"
import AnimalOverviewReportForm from "../components/AnimalOverviewReportForm"

const DataExtractionsPage = () => {
    return (
        <div className="flex flex-col gap-5">
            <AnimalOverviewReportForm />
            <AnimalDaysForm />
            <AnimalEntriesForm />
            <AnimalExitsForm />
        </div>
    )
}

export default DataExtractionsPage
