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
        <div>
            <Button
                label="Si"
                severity="success"
                onClick={() => {
                    setShowNewAdopterDialog(false)
                    setSection(Section.new)
                }}
            />
        </div>
    )
    useEffect(() => {}, [])

    return (
        <div className="flex flex-col h-full gap-3 max-w-3xl">
            <div className="grow">
                <div className="mb-2">
                    <PageTitle>Nuova adozione</PageTitle>
                </div>
                {animalQuery.data && <AnimalCard data={animalQuery.data} />}
                <Divider align="center">
                    <FontAwesomeIcon
                        icon={faHandHoldingHeart}
                        className="text-xl text-gray-600"
                    />
                </Divider>
                <div>
                    <div className="flex gap-2 mb-2 items-center w-full justify-center">
                        <Button
                            onClick={() => {
                                setSection(Section.search)
                            }}
                            disabled={section == Section.search}
                        >
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </Button>
                        <Button
                            onClick={() => {
                                setSection(Section.new)
                            }}
                            disabled={section == Section.new}
                        >
                            <FontAwesomeIcon icon={faAdd} />
                        </Button>
                    </div>

                    {section == Section.search && (
                        <div>
                            <SubTitle>Cerca adottante</SubTitle>
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
                                header="Nessun risultato, vuoi inserire un nuovo adottante?"
                                visible={showNewAdopterDialog}
                                style={{ width: "50vw" }}
                                onHide={() => setShowNewAdopterDialog(false)}
                                footer={dialogFooter}
                            />
                        </div>
                    )}

                    {section == Section.new && (
                        <div>
                            <SubTitle>Nuovo adottante</SubTitle>

                            <NewAdopterForm
                                onSaved={(data) => {
                                    setAdopter(data)
                                    setSection(Section.adopter)
                                }}
                            />
                        </div>
                    )}
                    {adopter && section == Section.adopter && (
                        <AdopterCard data={adopter} />
                    )}
                </div>
            </div>
            <div className="shrink-0 flex gap-2">
                <Button
                    onClick={() => onConfirm(false)}
                    severity="info"
                    className="text-center block font-bold w-full"
                    disabled={!adopter}
                >
                    Salva senza completare
                </Button>
                <Button
                    onClick={() => onConfirm(true)}
                    severity="success"
                    className="text-center block font-bold w-full"
                    disabled={!adopter}
                >
                    Completa
                </Button>
            </div>
            <Toast ref={toast} position="bottom-center" />
        </div>
    )
}

export default AnimalAdoptionPage
