import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "primereact/button"
import OverlayFormButton from "./OverlayFormButton" // The generic button component
import { useToolbar } from "../contexts/Toolbar"

const Toolbar = () => {
    const { buttons } = useToolbar()
    const sorted = [...buttons].sort((a, b) => (a.order ?? 50) - (b.order ?? 50))

    return (
        <div className="fixed bottom-8 right-8 flex gap-3 z-50">
            {sorted.map((button) =>
                button.onClick ? (
                    <Button
                        key={button.id}
                        className="shadow-lg !rounded-full px-6 py-3 gap-2 transition-all hover:shadow-xl hover:-translate-y-1 !font-bold"
                        severity={button.severity}
                        onClick={button.onClick}
                        disabled={button.disabled}
                        loading={button.loading}
                    >
                        <FontAwesomeIcon icon={button.buttonIcon} fixedWidth />{" "}
                        {button.buttonText}
                    </Button>
                ) : (
                    <OverlayFormButton
                        key={button.id}
                        buttonText={button.buttonText}
                        severity={button.severity}
                        buttonIcon={button.buttonIcon}
                        FormComponent={button.FormComponent!}
                        onSuccessAction={button.onSuccessAction!}
                        formProps={button.formProps}
                    />
                )
            )}
        </div>
    )
}

export default Toolbar
