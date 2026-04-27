import { useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import AnimalRecord from "../components/animal/AnimalRecord"
import Toolbar from "../components/Toolbar"
import { ToolbarProvider } from "../contexts/Toolbar"
import { useStructure } from "../contexts/StructureContext"
import { useAnimalQuery } from "../queries"
import { toastService } from "../services/toast"
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
    const { structures, currentStructure, setCurrentStructure } = useStructure()
    const warnedForAnimal = useRef<number | null>(null)

    useEffect(() => {
        const structureId = animalQuery.data?.structure_id
        if (!structureId || !currentStructure) return
        if (structureId === currentStructure.id) return
        if (warnedForAnimal.current === structureId) return

        const animalStructure = structures.find((s) => s.id === structureId)
        if (!animalStructure) return

        warnedForAnimal.current = structureId

        toastService.showWarn(
            <span className="flex flex-col gap-1">
                <span>
                    Questo animale appartiene a{" "}
                    <strong>{animalStructure.name}</strong>.
                </span>
                <button
                    className="text-left underline font-medium text-amber-900 hover:text-amber-700 transition-colors"
                    onClick={() => {
                        setCurrentStructure(animalStructure)
                        toastService.clear()
                    }}
                >
                    Passa a questa struttura →
                </button>
            </span>,
            "Struttura diversa",
        )
    }, [animalQuery.data?.structure_id, currentStructure?.id, structures])

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
