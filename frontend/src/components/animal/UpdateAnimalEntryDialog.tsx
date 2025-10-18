import { Dialog } from "primereact/dialog"
import { AnimalEntry } from "../../models/animal.schema"
import UpdateAnimalEntryForm from "./UpdateAnimalEntryForm"

type Props = {
    visible: boolean
    onHide: () => void
    animalId: string
    entry: AnimalEntry | null
}

const UpdateAnimalEntryDialog = ({
    visible,
    onHide,
    animalId,
    entry,
}: Props) => {
    if (!entry) return null

    return (
        <Dialog
            header="Modifica Ingresso/Uscita"
            visible={visible}
            style={{ width: "90vw", maxWidth: "800px" }}
            onHide={onHide}
            modal
            resizable={false}
            draggable={false}
        >
            <UpdateAnimalEntryForm
                animalId={animalId}
                entry={entry}
                onComplete={onHide}
                onCancel={onHide}
            />
        </Dialog>
    )
}

export default UpdateAnimalEntryDialog
