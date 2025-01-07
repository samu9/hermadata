import OverlayFormButton from "./OverlayFormButton" // The generic button component
import { useToolbar } from "../contexts/Toolbar"

const Toolbar = () => {
    const { buttons } = useToolbar()

    return (
        <div className="fixed bottom-4 right-4 flex gap-2 w-full justify-end">
            {buttons.map((button) => (
                <OverlayFormButton
                    key={button.id}
                    buttonText={button.buttonText}
                    buttonIcon={button.buttonIcon}
                    FormComponent={button.FormComponent}
                    onSuccessAction={button.onSuccessAction}
                />
            ))}
        </div>
    )
}

export default Toolbar
