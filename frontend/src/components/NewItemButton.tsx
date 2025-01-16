import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "primereact/button"
import { OverlayPanel } from "primereact/overlaypanel"
import { Toast } from "primereact/toast"
import React, { useRef } from "react"

type FormComponentProps<T> = {
    onSaved: (data: T) => void
}

type Props<T> = {
    label: string
    successLabel: string
    formComponent: React.ReactElement<FormComponentProps<T>>
}

const NewItemButton = <T,>(props: Props<T>) => {
    const op = useRef<OverlayPanel>(null)
    const toast = useRef<Toast>(null)
    const onNew = () => {
        toast.current?.show({
            severity: "success",
            summary: props.successLabel,
            // detail: `${adopter.name} ${adopter.surname}`,
        })
        op.current?.hide()
    }
    // Clone the form to inject the onSaved handler
    const clonedForm = React.cloneElement(props.formComponent, {
        onSaved: onNew,
    })
    return (
        <div>
            <div className="absolute bottom-4 right-4">
                <Button
                    className="shadow-lg"
                    onClick={(e) => op.current && op.current.toggle(e)}
                >
                    <FontAwesomeIcon icon={faPlus} fixedWidth />
                    {props.label}
                </Button>
                <OverlayPanel showCloseIcon ref={op}>
                    <div className="">{clonedForm}</div>
                </OverlayPanel>
                <Toast ref={toast} position="bottom-right" />
            </div>
        </div>
    )
}

export default NewItemButton
