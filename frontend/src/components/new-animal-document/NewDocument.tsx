import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "primereact/button"
import { OverlayPanel } from "primereact/overlaypanel"
import { useRef } from "react"
import { Toast } from "primereact/toast"
import AnimalDocUploadForm from "../animal/AnimalDocUploadForm"
import { AnimalDocument } from "../../models/animal.schema"

const NewAnimalDocument = () => {
    const op = useRef<OverlayPanel>(null)
    const toast = useRef<Toast>(null)
    const onNew = (doc: AnimalDocument) => {
        // toast.current?.show({
        //     severity: "success",
        //     summary: "Nuovo ingresso",
        //     detail: `Codice: ${code}`,
        // })
        op.current?.hide()
    }
    return (
        <div>
            <div className="absolute bottom-4 right-4">
                <Button
                    className="shadow-lg"
                    onClick={(e) => op.current && op.current.toggle(e)}
                >
                    <FontAwesomeIcon icon={faPlus} fixedWidth /> Inserisci
                    documento
                </Button>
                <OverlayPanel showCloseIcon ref={op}>
                    <div className="w-[20rem]">
                        <AnimalDocUploadForm onSuccess={onNew.bind(this)} />
                    </div>
                </OverlayPanel>
                <Toast ref={toast} position="bottom-right" />
            </div>
        </div>
    )
}

export default NewAnimalDocument
