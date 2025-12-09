import OverlayFormButton from "./OverlayFormButton" // The generic button component
import { useToolbar } from "../contexts/Toolbar"

const Toolbar = () => {
    const { buttons } = useToolbar()

    return (
        <div className="fixed bottom-8 right-8 flex gap-3 z-50">
            {buttons.map((button) => (
                <OverlayFormButton
                    key={button.id}
                    buttonText={button.buttonText}
                    severity={button.severity}
                    buttonIcon={button.buttonIcon}
                    FormComponent={button.FormComponent}
                    onSuccessAction={button.onSuccessAction}
                    formProps={button.formProps}
                />
            ))}
        </div>
    )
}

export default Toolbar
