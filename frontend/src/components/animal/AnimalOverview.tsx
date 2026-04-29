import { useParams } from "react-router-dom"
import {
    useAnimalQuery,
    useBreedsQuery,
    useAnimalSizesQuery,
    useAnimalFurTypesQuery,
    useAnimalFurColorsQuery,
} from "../../queries"
import { useEntryTypesMap } from "../../hooks/useMaps"
import AnimalOverviewMessages from "./AnimalOverviewMessages"
import { AnimalDataCard } from "./AnimalDataCard"
import {
    faUser,
    faIdCard,
    faDna,
    faCalendarAlt,
    faMapMarkerAlt,
    faHeart,
    faStickyNote,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { format } from "date-fns"
import {
    calculateAge,
    formatSex,
    formatSterilized,
    getLabelFromUtilItems,
    formatChipCode,
    formatTypeFromMap,
    getBreedName,
} from "../../utils/animalFormatters"
import { Skeleton } from "primereact/skeleton"

const AnimalOverviewSkeleton = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[0, 1].map((i) => (
                <div
                    key={i}
                    className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden"
                >
                    <div className="px-5 py-3.5 border-b border-surface-100 bg-surface-50">
                        <Skeleton width="8rem" height="0.75rem" />
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-5">
                        {Array(4)
                            .fill(0)
                            .map((_, j) => (
                                <div key={j} className="space-y-2">
                                    <Skeleton width="4rem" height="0.65rem" />
                                    <Skeleton width="6rem" height="0.85rem" />
                                </div>
                            ))}
                    </div>
                </div>
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[0, 1].map((i) => (
                <div
                    key={i}
                    className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden"
                >
                    <div className="px-5 py-3.5 border-b border-surface-100 bg-surface-50">
                        <Skeleton width="8rem" height="0.75rem" />
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-5">
                        {Array(4)
                            .fill(0)
                            .map((_, j) => (
                                <div key={j} className="space-y-2">
                                    <Skeleton width="4rem" height="0.65rem" />
                                    <Skeleton width="6rem" height="0.85rem" />
                                </div>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
)

const AnimalOverview = () => {
    const { id } = useParams()
    const animalQuery = useAnimalQuery(id!)

    // Queries for lookup data
    const breedsQuery = useBreedsQuery(animalQuery.data?.race_id)
    const sizesQuery = useAnimalSizesQuery()
    const furTypesQuery = useAnimalFurTypesQuery()
    const furColorsQuery = useAnimalFurColorsQuery()
    const entryTypesMap = useEntryTypesMap()

    if (animalQuery.isLoading) {
        return <AnimalOverviewSkeleton />
    }

    if (!animalQuery.data) {
        return (
            <div className="text-surface-500 text-sm py-8 text-center">
                Dati non disponibili
            </div>
        )
    }

    const animal = animalQuery.data

    const basicInfoItems = [
        {
            label: "Nome",
            value: animal.name || "Non assegnato",
            icon: (
                <FontAwesomeIcon icon={faUser} className="text-blue-500 w-4" />
            ),
        },
        {
            label: "Codice",
            value: animal.code,
            icon: (
                <FontAwesomeIcon
                    icon={faIdCard}
                    className="text-green-500 w-4"
                />
            ),
        },
        {
            label: "Chip",
            value: animal.without_chip ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    Senza chip
                </span>
            ) : (
                formatChipCode(animal.chip_code, animal.chip_code_set)
            ),
            icon: (
                <FontAwesomeIcon
                    icon={faIdCard}
                    className={
                        animal.without_chip
                            ? "text-red-400 w-4"
                            : "text-purple-500 w-4"
                    }
                />
            ),
        },
        {
            label: "Sesso",
            value: formatSex(animal.sex),
            icon: (
                <FontAwesomeIcon icon={faDna} className="text-pink-500 w-4" />
            ),
        },
    ]

    const physicalCharacteristics = [
        {
            label: "Razza",
            value: getBreedName(breedsQuery.data, animal.breed_id),
            icon: (
                <FontAwesomeIcon icon={faDna} className="text-orange-500 w-4" />
            ),
        },
        {
            label: "Taglia",
            value: getLabelFromUtilItems(sizesQuery.data, animal.size),
            icon: (
                <FontAwesomeIcon icon={faDna} className="text-blue-600 w-4" />
            ),
        },
        {
            label: "Tipo pelo",
            value: getLabelFromUtilItems(furTypesQuery.data, animal.fur),
            icon: (
                <FontAwesomeIcon icon={faDna} className="text-amber-600 w-4" />
            ),
        },
        {
            label: "Colore",
            value: getLabelFromUtilItems(furColorsQuery.data, animal.color),
            icon: (
                <FontAwesomeIcon icon={faDna} className="text-yellow-600 w-4" />
            ),
        },
        {
            label: "Sterilizzato",
            value: formatSterilized(animal.sterilized),
            icon: (
                <FontAwesomeIcon icon={faHeart} className="text-red-500 w-4" />
            ),
        },
    ]

    const dateAndEntryInfo = [
        {
            label: "Data di nascita",
            value: animal.birth_date
                ? format(new Date(animal.birth_date), "dd/MM/yyyy")
                : "-",
            icon: (
                <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="text-green-600 w-4"
                />
            ),
        },
        {
            label: "Età",
            value: calculateAge(animal.birth_date),
            icon: (
                <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="text-blue-700 w-4"
                />
            ),
        },
        {
            label: "Data ingresso",
            value: animal.entry_date
                ? format(new Date(animal.entry_date), "dd/MM/yyyy")
                : "-",
            icon: (
                <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="text-indigo-500 w-4"
                />
            ),
        },
        {
            label: "Tipo ingresso",
            value: formatTypeFromMap(entryTypesMap, animal.entry_type),
            icon: (
                <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="text-purple-600 w-4"
                />
            ),
        },
    ]

    const notesItems = animal.notes
        ? [
              {
                  label: "",
                  value: animal.notes,
                  icon: undefined,
              },
          ]
        : []

    return (
        <div className="space-y-6">
            <AnimalOverviewMessages animal_id={id!} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimalDataCard
                    title="Informazioni Generali"
                    items={basicInfoItems}
                    icon={
                        <FontAwesomeIcon
                            icon={faUser}
                            className="text-blue-500"
                        />
                    }
                />

                <AnimalDataCard
                    title="Caratteristiche Fisiche"
                    items={physicalCharacteristics}
                    icon={
                        <FontAwesomeIcon
                            icon={faDna}
                            className="text-green-500"
                        />
                    }
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimalDataCard
                    title="Date ed Ingresso"
                    items={dateAndEntryInfo}
                    icon={
                        <FontAwesomeIcon
                            icon={faCalendarAlt}
                            className="text-purple-500"
                        />
                    }
                />

                {notesItems.length > 0 && (
                    <AnimalDataCard
                        title="Note"
                        items={notesItems}
                        icon={
                            <FontAwesomeIcon
                                icon={faStickyNote}
                                className="text-amber-500"
                            />
                        }
                    />
                )}
            </div>
        </div>
    )
}

export default AnimalOverview
