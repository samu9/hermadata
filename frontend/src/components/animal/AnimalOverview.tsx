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
        return <div>Caricamento...</div>
    }

    if (!animalQuery.data) {
        return <div>Dati non disponibili</div>
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
            value: formatChipCode(animal.chip_code, animal.chip_code_set),
            icon: (
                <FontAwesomeIcon
                    icon={faIdCard}
                    className="text-purple-500 w-4"
                />
            ),
        },
        {
            label: "Senza chip",
            value: animal.without_chip ? "Sì" : "No",
            icon: (
                <FontAwesomeIcon icon={faIdCard} className="text-red-400 w-4" />
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
            label: "Tipo mantello",
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
                  label: null,
                  value: animal.notes,
                  icon: null,
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
