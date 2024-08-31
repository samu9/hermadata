import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "primereact/button"
import { OverlayPanel } from "primereact/overlaypanel"
import { useRef } from "react"
import { Toast } from "primereact/toast"
import NewAdopterForm from "./NewAdopterForm"
import { Adopter } from "../../models/adopter.schema"

type Props = {
    // first entry must also specify race
    animalId?: string
}

const NewAdopterButton = (props: Props) => {
    const op = useRef<OverlayPanel>(null)
    const toast = useRef<Toast>(null)
    const onNew = (adopter: Adopter) => {
        toast.current?.show({
            severity: "success",
            summary: "Nuovo adottante",
            detail: `${adopter.name} ${adopter.surname}`,
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
                    Nuovo adottante
                </Button>
                <OverlayPanel showCloseIcon ref={op}>
                    <div className="">
                        <NewAdopterForm onSaved={(a) => onNew(a)} />
                    </div>
                </OverlayPanel>
                <Toast ref={toast} position="bottom-right" />
            </div>
        </div>
    )
}

export default NewAdopterButton
