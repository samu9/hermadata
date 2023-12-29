import { Dropdown } from "primereact/dropdown"
import { Controller, useFormContext } from "react-hook-form"
import { classNames } from "primereact/utils"
import { Button } from "primereact/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { OverlayPanel } from "primereact/overlaypanel"
import { useRef } from "react"
import { useDocKindsQuery } from "../../queries"
import AddDocKindForm from "../AddDocKindForm"
import { DocKind } from "../../models/docs.schema"

type Props = {
    raceId?: string
    className?: string
    defaultValue?: number
}
const ControlledDocKindsDropdown = (props: Props) => {
    const docKindsQuery = useDocKindsQuery()
    const form = useFormContext<{ document_kind_id: number }>()
    const op = useRef<OverlayPanel>(null)

    const { setValue } = form
    return (
        <Controller
            name="document_kind_id"
            control={form.control}
            defaultValue={props.defaultValue}
            render={({ field }) => (
                <div className="w-1/2">
                    <label
                        className="text-xs text-gray-500"
                        htmlFor={field.name}
                    >
                        Tipo
                    </label>
                    <div className="p-inputgroup">
                        <Dropdown
                            {...field}
                            options={docKindsQuery.data}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Seleziona"
                            className={classNames(
                                "w-full md:w-14rem",
                                props.className
                            )}
                        />
                        <Button
                            type="button"
                            onClick={(e) => {
                                op.current && op.current.toggle(e)
                            }}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </Button>
                    </div>
                    <OverlayPanel showCloseIcon ref={op}>
                        <div className="w-[20rem]">
                            <AddDocKindForm
                                onSuccess={(docKind: DocKind) => {
                                    setValue("document_kind_id", docKind.id)
                                    op.current?.toggle(null)
                                }}
                            />
                        </div>
                    </OverlayPanel>
                </div>
            )}
        />
    )
}

export default ControlledDocKindsDropdown
