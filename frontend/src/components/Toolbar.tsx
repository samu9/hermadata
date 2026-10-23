import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "primereact/button"
import OverlayFormButton from "./OverlayFormButton" // The generic button component
import { ToolbarButton, useToolbar } from "../contexts/Toolbar"

const byOrder = (a: ToolbarButton, b: ToolbarButton) =>
    (a.order ?? 50) - (b.order ?? 50)

const buttonClassName =
    "!rounded-full px-5 py-2.5 gap-2 !font-bold whitespace-nowrap"

const ToolbarItem = ({ button }: { button: ToolbarButton }) => {
    // Record-wide actions are secondary (outlined), page actions are primary
    const outlined = button.group !== "page"

    return button.onClick ? (
        <Button
            className={buttonClassName}
            severity={button.severity}
            outlined={outlined}
            onClick={button.onClick}
            disabled={button.disabled}
            loading={button.loading}
        >
            <FontAwesomeIcon icon={button.buttonIcon} fixedWidth />{" "}
            {button.buttonText}
        </Button>
    ) : (
        <OverlayFormButton
            buttonText={button.buttonText}
            severity={button.severity}
            outlined={outlined}
            className={buttonClassName}
            buttonIcon={button.buttonIcon}
            FormComponent={button.FormComponent!}
            onSuccessAction={button.onSuccessAction!}
            formProps={button.formProps}
        />
    )
}

const Toolbar = () => {
    const { buttons } = useToolbar()
    const recordButtons = buttons.filter((b) => b.group !== "page").sort(byOrder)
    const pageButtons = buttons.filter((b) => b.group === "page").sort(byOrder)

    if (buttons.length === 0) return null

    return (
        <>
            {/* Reserve space so the floating bar never covers page content */}
            <div className="h-24" aria-hidden />
            <div className="fixed bottom-6 right-8 z-50 flex items-center gap-3 rounded-full border border-surface-200 bg-white/90 p-2 shadow-xl backdrop-blur">
                {recordButtons.map((button) => (
                    <ToolbarItem key={button.id} button={button} />
                ))}
                {recordButtons.length > 0 && pageButtons.length > 0 && (
                    <div className="h-8 w-px bg-surface-300" aria-hidden />
                )}
                {pageButtons.map((button) => (
                    <ToolbarItem key={button.id} button={button} />
                ))}
            </div>
        </>
    )
}

export default Toolbar
