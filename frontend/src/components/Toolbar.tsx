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
                button.onClick && button.subtle ? (
                    <Button
                        key={button.id}
                        className="!rounded-full !w-10 !h-10 !p-0 justify-center self-center mr-8 bg-white/80 opacity-60 transition-opacity hover:opacity-100"
                        severity={button.severity}
                        outlined
                        onClick={button.onClick}
                        disabled={button.disabled}
                        loading={button.loading}
                        tooltip={button.buttonText}
                        tooltipOptions={{ position: "top" }}
                        aria-label={button.buttonText}
                    >
                        <FontAwesomeIcon icon={button.buttonIcon} fixedWidth />
                    </Button>
                ) : button.onClick ? (
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
