import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "primereact/button"
import { OverlayPanel } from "primereact/overlaypanel"
import { useRef } from "react"
import { SeverityType } from "../constants"

interface OverlayFormButtonProps<T> {
    buttonText: string
    buttonIcon: any
    severity?: SeverityType

    FormComponent: React.ComponentType<{ onSuccess: (data: T) => void } & any>
    formProps?: Record<string, any>
    onSuccessAction: (data: T) => void
}

const OverlayFormButton = <T,>({
    buttonText,
    buttonIcon,
    severity,
    FormComponent,
    formProps = {},
    onSuccessAction,
}: OverlayFormButtonProps<T>) => {
    const op = useRef<OverlayPanel>(null)

    const handleSuccess = (data: T) => {
        onSuccessAction(data)
        op.current?.hide()
    }

    return (
        <div>
            <Button
                className="shadow-lg !rounded-full !w-12 !h-12 !p-0 justify-center sm:!w-auto sm:!h-auto sm:!px-6 sm:!py-3 gap-2 transition-all hover:shadow-xl hover:-translate-y-1 !font-bold"
                aria-label={buttonText}
                severity={severity}
                onClick={(e) => op.current && op.current.toggle(e)}
            >
                <FontAwesomeIcon icon={buttonIcon} fixedWidth />
                <span className="hidden sm:inline">{buttonText}</span>
            </Button>
            <OverlayPanel
                showCloseIcon
                ref={op}
                className="shadow-xl rounded-xl border border-surface-200"
                pt={{
                    content: { className: "p-0" },
                    closeButton: {
                        className:
                            "w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-100 transition-colors m-2",
                    },
                }}
            >
                <div className="w-[90vw] max-w-[25rem] p-6 bg-white rounded-xl">
                    <FormComponent onSuccess={handleSuccess} {...formProps} />
                </div>
            </OverlayPanel>
        </div>
    )
}

export default OverlayFormButton
