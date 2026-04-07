import { useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import AnimalRecord from "../components/animal/AnimalRecord"
import Toolbar from "../components/Toolbar"
import { ToolbarProvider } from "../contexts/Toolbar"
import { useStructure } from "../contexts/StructureContext"
import { useAnimalQuery } from "../queries"
import { toastService } from "../services/toast"

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
                {animalQuery.data && (
                    <div>
                        <AnimalRecord data={animalQuery.data} />
                    </div>
                )}
                <Toolbar />
            </div>
        </ToolbarProvider>
    )
}

export default AnimalProfilePage
