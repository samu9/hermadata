import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "primereact/button"
import OverlayFormButton from "./OverlayFormButton" // The generic button component
import { useToolbar } from "../contexts/Toolbar"

// On mobile the buttons collapse to icon-only circles; the label shows from `sm` up.
const FAB_CLASS =
    "shadow-lg !rounded-full !w-12 !h-12 !p-0 justify-center sm:!w-auto sm:!h-auto sm:!px-6 sm:!py-3 gap-2 transition-all hover:shadow-xl hover:-translate-y-1 !font-bold"

const Toolbar = () => {
    const { buttons } = useToolbar()
    const sorted = [...buttons].sort((a, b) => (a.order ?? 50) - (b.order ?? 50))

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 flex flex-wrap justify-end gap-3 z-50">
            {sorted.map((button) =>
                button.onClick ? (
                    <Button
                        key={button.id}
                        className={FAB_CLASS}
                        aria-label={button.buttonText}
                        severity={button.severity}
                        onClick={button.onClick}
                        disabled={button.disabled}
                        loading={button.loading}
                    >
                        <FontAwesomeIcon icon={button.buttonIcon} fixedWidth />
                        <span className="hidden sm:inline">
                            {button.buttonText}
                        </span>
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
