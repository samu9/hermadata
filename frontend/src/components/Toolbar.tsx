import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUserShield } from "@fortawesome/free-solid-svg-icons"
import { Button } from "primereact/button"
import OverlayFormButton from "./OverlayFormButton" // The generic button component
import { useToolbar } from "../contexts/Toolbar"

const Toolbar = () => {
    const { buttons } = useToolbar()
    const sortByOrder = (a: (typeof buttons)[number], b: typeof a) =>
        (a.order ?? 50) - (b.order ?? 50)

    const superUserButtons = buttons
        .filter((b) => b.group === "superuser")
        .sort(sortByOrder)
    const defaultButtons = buttons
        .filter((b) => b.group !== "superuser")
        .sort(sortByOrder)

    const renderButton = (button: (typeof buttons)[number]) => {
        const inner = button.onClick ? (
            <Button
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
                buttonText={button.buttonText}
                severity={button.severity}
                buttonIcon={button.buttonIcon}
                FormComponent={button.FormComponent!}
                onSuccessAction={button.onSuccessAction!}
                formProps={button.formProps}
            />
        )

        if (button.group !== "superuser") {
            return <div key={button.id}>{inner}</div>
        }

        return (
            <div key={button.id} className="relative">
                {inner}
                <span
                    className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-white text-gray-700 shadow ring-1 ring-gray-300 pointer-events-none"
                    title="Azione riservata ai super user"
                >
                    <FontAwesomeIcon icon={faUserShield} className="text-xs" />
                </span>
            </div>
        )
    }

    return (
        <div className="fixed bottom-8 right-8 flex items-center gap-3 z-50">
            {superUserButtons.map(renderButton)}
            {superUserButtons.length > 0 && defaultButtons.length > 0 && (
                <div className="self-stretch w-px bg-gray-300 mx-2" />
            )}
            {defaultButtons.map(renderButton)}
        </div>
    )
}

export default Toolbar
