import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { AnimalDocument } from "../../models/animal.schema"
import AnimalDocUploadForm from "../animal/AnimalDocUploadForm"
import OverlayFormButton from "../OverlayFormButton"

const NewAnimalDocument = () => {
    const handleNewAnimalDocument = (doc: AnimalDocument) => {
        console.log("New Animal Document Added:", doc)
        // Example: Show a toast or update state
        // toast.current?.show({
        //     severity: "success",
        //     summary: "Nuovo ingresso",
        //     detail: `Codice: ${doc.code}`,
        // });
    }

    return (
        <OverlayFormButton
            buttonText="Inserisci documento"
            buttonIcon={faPlus}
            FormComponent={AnimalDocUploadForm}
            onSuccessAction={handleNewAnimalDocument}
        />
    )
}

export default NewAnimalDocument
