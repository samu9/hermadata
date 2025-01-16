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
        <div className="bottom-4 right-4">
            <Button
                className="shadow-lg flex gap-2"
                severity={severity}
                onClick={(e) => op.current && op.current.toggle(e)}
            >
                <FontAwesomeIcon icon={buttonIcon} fixedWidth /> {buttonText}
            </Button>
            <OverlayPanel showCloseIcon ref={op}>
                <div className="w-[20rem]">
                    <FormComponent onSuccess={handleSuccess} {...formProps} />
                </div>
            </OverlayPanel>
        </div>
    )
}

export default OverlayFormButton
