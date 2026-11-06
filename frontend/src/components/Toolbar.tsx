import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "primereact/button"
import OverlayFormButton from "./OverlayFormButton" // The generic button component
import { ToolbarButton, useToolbar } from "../contexts/Toolbar"
import { useIsMobile } from "../hooks/useMediaQuery"

const byOrder = (a: ToolbarButton, b: ToolbarButton) =>
    (a.order ?? 50) - (b.order ?? 50)

const buttonClassName =
    "!rounded-full px-5 py-2.5 gap-2 !font-bold whitespace-nowrap"

const subtleButtonClassName =
    "!rounded-full !px-3 !py-1.5 gap-1.5 !text-sm whitespace-nowrap hover:!bg-red-50"

// Mobile: icon-only circle; the label moves to aria-label.
const mobileButtonClassName =
    "!rounded-full !w-11 !h-11 !p-0 justify-center shrink-0"

const Divider = ({ className = "" }: { className?: string }) => (
    <div className={`h-8 w-px bg-surface-300 ${className}`} aria-hidden />
)

const ToolbarItem = ({ button }: { button: ToolbarButton }) => {
    const isMobile = useIsMobile()
    // Record-wide actions are secondary (outlined), page actions are primary
    const outlined = button.group !== "page"

    if (button.onClick && button.subtle && !isMobile) {
        return (
            <Button
                className={subtleButtonClassName}
                severity={button.severity}
                outlined
                size="small"
                onClick={button.onClick}
                disabled={button.disabled}
                loading={button.loading}
            >
                <FontAwesomeIcon icon={button.buttonIcon} fixedWidth />
                {button.buttonText}
            </Button>
        )
    }

    return button.onClick ? (
        <Button
            className={isMobile ? mobileButtonClassName : buttonClassName}
            aria-label={button.buttonText}
            severity={button.severity}
            outlined={outlined || button.subtle}
            onClick={button.onClick}
            disabled={button.disabled}
            loading={button.loading}
        >
            <FontAwesomeIcon icon={button.buttonIcon} fixedWidth />
            {!isMobile && <span>{button.buttonText}</span>}
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
    // Subtle (destructive) actions sit apart, at the far left of the bar
    const subtleButtons = buttons.filter((b) => b.subtle).sort(byOrder)
    const recordButtons = buttons
        .filter((b) => !b.subtle && b.group !== "page")
        .sort(byOrder)
    const pageButtons = buttons
        .filter((b) => !b.subtle && b.group === "page")
        .sort(byOrder)

    if (buttons.length === 0) return null

    const hasMainButtons = recordButtons.length > 0 || pageButtons.length > 0

    return (
        <>
            {/* Reserve space so the floating bar never covers page content */}
            <div className="h-24" aria-hidden />
            <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 overflow-x-auto rounded-full sm:gap-3 lg:bottom-6 lg:right-8 border border-surface-200 bg-white/90 p-2 shadow-xl backdrop-blur">
                {subtleButtons.map((button) => (
                    <ToolbarItem key={button.id} button={button} />
                ))}
                {subtleButtons.length > 0 && hasMainButtons && (
                    <Divider className="mx-1 lg:mx-3" />
                )}
                {recordButtons.map((button) => (
                    <ToolbarItem key={button.id} button={button} />
                ))}
                {recordButtons.length > 0 && pageButtons.length > 0 && (
                    <Divider />
                )}
                {pageButtons.map((button) => (
                    <ToolbarItem key={button.id} button={button} />
                ))}
            </div>
        </>
    )
}

export default Toolbar
