import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "primereact/button"
import { OverlayPanel } from "primereact/overlaypanel"
import { useRef } from "react"
import NewAnimalForm from "./NewAnimalEntryForm"
import { Toast } from "primereact/toast"

const NewEntry = () => {
    const op = useRef<OverlayPanel>(null)
    const toast = useRef<Toast>(null)
    const onNew = (code: string) => {
        console.log(code)
        toast.current?.show({
            severity: "success",
            summary: "Nuovo ingresso",
            detail: `Codice: ${code}`,
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
                    <FontAwesomeIcon icon={faPlus} fixedWidth /> Nuovo ingresso
                </Button>
                <OverlayPanel showCloseIcon ref={op}>
                    <div className="w-[20rem]">
                        <NewAnimalForm onSuccess={onNew.bind(this)} />
                    </div>
                </OverlayPanel>
                <Toast ref={toast} position="bottom-right" />
            </div>
        </div>
    )
}

export default NewEntry
