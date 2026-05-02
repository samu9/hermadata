import { useParams } from "react-router-dom"
import AnimalRecord from "../components/animal/AnimalRecord"
import Toolbar from "../components/Toolbar"
import { ToolbarProvider } from "../contexts/Toolbar"
import { useAnimalQuery } from "../queries"
import { Skeleton } from "primereact/skeleton"

const AnimalProfileSkeleton = () => (
    <div className="space-y-6">
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
            <div className="flex gap-6 items-start">
                <Skeleton shape="circle" size="8rem" />
                <div className="flex-1 space-y-3 pt-2">
                    <Skeleton width="6rem" height="1.5rem" />
                    <Skeleton width="14rem" height="2rem" />
                    <div className="flex gap-3">
                        <Skeleton width="9rem" height="1.75rem" borderRadius="9999px" />
                        <Skeleton width="5rem" height="1.75rem" borderRadius="9999px" />
                    </div>
                </div>
            </div>
        </div>
        <div className="flex gap-6 border-b border-surface-200 pb-0">
            {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} width="5rem" height="2.5rem" />
            ))}
        </div>
    </div>
)

const AnimalProfilePage = () => {
    const { id } = useParams()
    const animalQuery = useAnimalQuery(id!)

    return (
        <ToolbarProvider>
            <div>
                {animalQuery.isLoading ? (
                    <AnimalProfileSkeleton />
                ) : animalQuery.data ? (
                    <AnimalRecord data={animalQuery.data} />
                ) : null}
                <Toolbar />
            </div>
        </ToolbarProvider>
    )
}

export default AnimalProfilePage
