import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { OverlayPanel } from "primereact/overlaypanel"
import { Button } from "primereact/button"
import { Toast } from "primereact/toast"
import { useRef } from "react"

interface OverlayFormButtonProps<T> {
    buttonText: string
    buttonIcon: any // Use the appropriate FontAwesomeIcon type
    FormComponent: React.ComponentType<{ onSuccess: (data: T) => void }>
    onSuccessAction: (data: T) => void
}

const OverlayFormButton = <T,>({
    buttonText,
    buttonIcon,
    FormComponent,
    onSuccessAction,
}: OverlayFormButtonProps<T>) => {
    const op = useRef<OverlayPanel>(null)
    const toast = useRef<Toast>(null)

    const handleSuccess = (data: T) => {
        onSuccessAction(data)
        op.current?.hide()
    }

    return (
        <div>
            <Button
                className="shadow-lg"
                onClick={(e) => op.current && op.current.toggle(e)}
            >
                <FontAwesomeIcon icon={buttonIcon} fixedWidth /> {buttonText}
            </Button>
            <OverlayPanel showCloseIcon ref={op}>
                <div className="w-[20rem]">
                    <FormComponent onSuccess={handleSuccess} />
                </div>
            </OverlayPanel>
            <Toast ref={toast} position="bottom-right" />
        </div>
    )
}

export default OverlayFormButton
