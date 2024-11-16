import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "primereact/button"
import { OverlayPanel } from "primereact/overlaypanel"
import { useRef } from "react"
import { Toast } from "primereact/toast"
import NewVetForm from "./NewVetForm"
import { Vet } from "../../models/vet.schema"

type Props = {
    // first entry must also specify race
    animalId?: string
}

const NewVetButton = (props: Props) => {
    const op = useRef<OverlayPanel>(null)
    const toast = useRef<Toast>(null)
    const onNew = (vet: Vet) => {
        toast.current?.show({
            severity: "success",
            summary: "Nuovo veterinario",
            detail: `${vet.name} ${vet.surname}`,
        })
        op.current?.hide()
    }

    return (
        <div>
            <div className="absolute bottom-4 right-4">
                <Button
                    className="shadow-lg"
                    onClick={(e) => op.current && op.current.toggle(e)}
                >
                    <FontAwesomeIcon icon={faPlus} fixedWidth />
                    Nuovo veterinario
                </Button>
                <OverlayPanel showCloseIcon ref={op}>
                    <div className="">
                        <NewVetForm onSaved={(a) => onNew(a)} />
                    </div>
                </OverlayPanel>
                <Toast ref={toast} position="bottom-right" />
            </div>
        </div>
    )
}

export default NewVetButton
