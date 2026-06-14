import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "primereact/button"
import OverlayFormButton from "./OverlayFormButton" // The generic button component
import { useToolbar } from "../contexts/Toolbar"
import { useIsMobile } from "../hooks/useMediaQuery"

// Exact original desktop styling (labeled pill).
const DESKTOP_FAB =
    "shadow-lg !rounded-full px-6 py-3 gap-2 transition-all hover:shadow-xl hover:-translate-y-1 !font-bold"
// Mobile: icon-only 48px circle.
const MOBILE_FAB =
    "shadow-lg !rounded-full !w-12 !h-12 !p-0 justify-center gap-2 transition-all hover:shadow-xl hover:-translate-y-1 !font-bold"

const Toolbar = () => {
    const { buttons } = useToolbar()
    const isMobile = useIsMobile()
    const sorted = [...buttons].sort((a, b) => (a.order ?? 50) - (b.order ?? 50))

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 flex flex-wrap justify-end gap-3 z-50">
            {sorted.map((button) =>
                button.onClick ? (
                    <Button
                        key={button.id}
                        className={isMobile ? MOBILE_FAB : DESKTOP_FAB}
                        aria-label={button.buttonText}
                        severity={button.severity}
                        onClick={button.onClick}
                        disabled={button.disabled}
                        loading={button.loading}
                    >
                        <FontAwesomeIcon icon={button.buttonIcon} fixedWidth />
                        {!isMobile && <span>{button.buttonText}</span>}
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
