import { Dialog } from "primereact/dialog"
import AnimalImageUploadForm from "./AnimalImageUploadForm"

type Props = {
    visible: boolean
    onHide: () => void
    animalId: string
    animalName?: string
}

const AnimalImageUploadDialog = ({
    visible,
    onHide,
    animalId,
    animalName,
}: Props) => {
    return (
        <Dialog
            header={`Carica immagine - ${animalName || "Animale"}`}
            visible={visible}
            style={{ width: "90vw", maxWidth: "500px" }}
            onHide={onHide}
            modal
            resizable={false}
            draggable={false}
        >
            <AnimalImageUploadForm
                animalId={animalId}
                onSuccess={onHide}
                onComplete={onHide}
            />
        </Dialog>
    )
}

export default AnimalImageUploadDialog