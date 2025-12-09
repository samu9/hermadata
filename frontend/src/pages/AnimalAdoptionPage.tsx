import { faAdd, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import { faHandHoldingHeart } from "@fortawesome/free-solid-svg-icons/faHandHoldingHeart"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { Divider } from "primereact/divider"
import { Toast } from "primereact/toast"
import { useEffect, useRef, useState } from "react"
import { useMutation } from "react-query"
import { useNavigate, useParams } from "react-router-dom"
import NewAdopterForm from "../components/adopter/NewAdopterForm"
import AdopterCard from "../components/adoption/AdopterCard"
import AnimalCard from "../components/adoption/AnimalCard"
import SearchAdopter from "../components/adoption/SearchAdopter"
import { PageTitle, SubTitle } from "../components/typography"
import { apiService } from "../main"
import { Adopter } from "../models/adopter.schema"
import {
    AnimalExit,
    animalExitSchema,
    NewAnimalAdoption,
} from "../models/animal.schema"
import { useAnimalQuery } from "../queries"

enum Section {
    search = "search",
    new = "new",
    adopter = "adopter",
}

const AnimalAdoptionPage = () => {
    const { id } = useParams()
    if (!id) {
        throw new Error("Animal id not defined")
    }
    const navigate = useNavigate()
    const [section, setSection] = useState<Section | null>(Section.search)
    const [showNewAdopterDialog, setShowNewAdopterDialog] = useState(false)
    const [adopter, setAdopter] = useState<Adopter | null>(null)
    const toast = useRef<Toast>(null)

    const animalQuery = useAnimalQuery(id!)

    const newAdoptionMutation = useMutation({
        mutationKey: "new-adoption",
        mutationFn: (data: AnimalExit) => apiService.animalExit(data),
        onSuccess: (data, variables) => {
            toast.current?.show({
                severity: "success",
                summary: "Adozione completata!",
            })
            navigate(`/animal/${variables.animal_id}`)
        },
    })

    const onConfirm = (completed: boolean) => {
        if (!adopter) {
            return
        }
        const adoptionData: NewAnimalAdoption = {
            animal_id: parseInt(id),
            adopter_id: adopter.id,
            completed,
        }
        const exitPayload: AnimalExit = animalExitSchema.parse({
            exit_data: adoptionData,
            exit_type: "A",
            exit_date: new Date(),
            animal_id: parseInt(id),
        })

        newAdoptionMutation.mutate(exitPayload)
    }
    const dialogFooter = (
        <div className="flex justify-end gap-2">
            <Button
                label="Annulla"
                className="p-button-text !text-surface-600 hover:!bg-surface-100"
                onClick={() => setShowNewAdopterDialog(false)}
            />
            <Button
                label="Si, crea nuovo"
                className="!bg-primary-600 !border-primary-600 hover:!bg-primary-700"
                onClick={() => {
                    setShowNewAdopterDialog(false)
                    setSection(Section.new)
                }}
            />
        </div>
    )
    useEffect(() => {}, [])

    return (
        <div className="flex flex-col h-full gap-6 max-w-4xl mx-auto p-4">
            <div className="grow space-y-6">
                <div className="flex items-center justify-between">
                    <PageTitle>Nuova adozione</PageTitle>
                </div>

                {animalQuery.data && <AnimalCard data={animalQuery.data} />}

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-surface-200"></div>
                    <span className="flex-shrink-0 mx-4 text-surface-400">
                        <FontAwesomeIcon
                            icon={faHandHoldingHeart}
                            className="text-2xl"
                        />
                    </span>
                    <div className="flex-grow border-t border-surface-200"></div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
                    <div className="flex gap-2 mb-6 items-center w-full justify-center">
                        <Button
                            className={`!px-6 !py-3 !rounded-lg transition-all ${
                                section === Section.search
                                    ? "!bg-primary-600 !text-white !border-primary-600"
                                    : "!bg-surface-100 !text-surface-600 !border-surface-100 hover:!bg-surface-200"
                            }`}
                            onClick={() => {
                                setSection(Section.search)
                            }}
                            disabled={section == Section.search}
                            tooltip="Cerca esistente"
                        >
                            <FontAwesomeIcon
                                icon={faMagnifyingGlass}
                                className="mr-2"
                            />
                            <span className="font-semibold">Cerca</span>
                        </Button>
                        <Button
                            className={`!px-6 !py-3 !rounded-lg transition-all ${
                                section === Section.new
                                    ? "!bg-primary-600 !text-white !border-primary-600"
                                    : "!bg-surface-100 !text-surface-600 !border-surface-100 hover:!bg-surface-200"
                            }`}
                            onClick={() => {
                                setSection(Section.new)
                            }}
                            disabled={section == Section.new}
                            tooltip="Nuovo adottante"
                        >
                            <FontAwesomeIcon icon={faAdd} className="mr-2" />
                            <span className="font-semibold">Nuovo</span>
                        </Button>
                    </div>

                    {section == Section.search && (
                        <div className="animate-fade-in">
                            <div className="mb-4">
                                <SubTitle>Cerca adottante</SubTitle>
                            </div>
                            <SearchAdopter
                                onSelected={(data) => {
                                    setAdopter(data)
                                    setSection(Section.adopter)
                                }}
                                onNoResultsCallback={() => {
                                    setShowNewAdopterDialog(true)
                                }}
                            />
                            <Dialog
                                header="Nessun risultato"
                                visible={showNewAdopterDialog}
                                style={{ width: "50vw" }}
                                onHide={() => setShowNewAdopterDialog(false)}
                                footer={dialogFooter}
                                pt={{
                                    root: {
                                        className:
                                            "bg-white rounded-xl shadow-xl border border-surface-200",
                                    },
                                    header: {
                                        className:
                                            "p-4 border-b border-surface-200 bg-surface-50 rounded-t-xl",
                                    },
                                    title: {
                                        className:
                                            "text-xl font-bold text-surface-900",
                                    },
                                    content: { className: "p-6" },
                                    footer: {
                                        className:
                                            "p-4 border-t border-surface-200 bg-surface-50 rounded-b-xl",
                                    },
                                    closeButton: {
                                        className:
                                            "hover:bg-surface-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors",
                                    },
                                }}
                            >
                                <p className="text-surface-600">
                                    Non abbiamo trovato nessun adottante con
                                    questi criteri. Vuoi inserirne uno nuovo?
                                </p>
                            </Dialog>
                        </div>
                    )}

                    {section == Section.new && (
                        <div className="animate-fade-in">
                            <div className="mb-4">
                                <SubTitle>Nuovo adottante</SubTitle>
                            </div>

                            <NewAdopterForm
                                onSaved={(data) => {
                                    setAdopter(data)
                                    setSection(Section.adopter)
                                }}
                            />
                        </div>
                    )}
                    {adopter && section == Section.adopter && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <SubTitle>Adottante selezionato</SubTitle>
                                <Button
                                    icon="pi pi-times"
                                    className="p-button-rounded p-button-text !text-surface-500 hover:!bg-surface-100"
                                    onClick={() => {
                                        setAdopter(null)
                                        setSection(Section.search)
                                    }}
                                    tooltip="Rimuovi selezione"
                                />
                            </div>
                            <AdopterCard data={adopter} variant="selected" />
                        </div>
                    )}
                </div>
            </div>

            <div className="shrink-0 flex gap-4 pt-4 border-t border-surface-200 bg-surface-50 -mx-4 px-4 -mb-4 pb-4 sticky bottom-0 z-10">
                <Button
                    onClick={() => onConfirm(false)}
                    className="!bg-white !text-surface-700 !border-surface-300 hover:!bg-surface-50 w-full justify-center font-bold shadow-sm"
                    disabled={!adopter}
                >
                    Salva senza completare
                </Button>
                <Button
                    onClick={() => onConfirm(true)}
                    className="!bg-primary-600 !border-primary-600 hover:!bg-primary-700 w-full justify-center font-bold shadow-sm"
                    disabled={!adopter}
                >
                    Completa adozione
                </Button>
            </div>
            <Toast ref={toast} position="bottom-center" />
        </div>
    )
}

export default AnimalAdoptionPage
