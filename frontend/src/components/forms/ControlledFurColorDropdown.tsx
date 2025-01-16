import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "primereact/button"
import { Dropdown } from "primereact/dropdown"
import { OverlayPanel } from "primereact/overlaypanel"
import { classNames } from "primereact/utils"
import { useRef } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { IntUtilItem } from "../../models/util.schema"
import { useAnimalFurColorsQuery } from "../../queries"
import AddFurColorForm from "../AddFurColorForm"

type Props = {
    className?: string
    defaultValue?: number
    onAdd?: (furColor: IntUtilItem) => void
}
const ControlledFurColorsDropdown = (props: Props) => {
    const animalFurColorsQuery = useAnimalFurColorsQuery()
    const form = useFormContext<{ color: number }>()
    const op = useRef<OverlayPanel>(null)

    const { setValue } = form
    return (
        <Controller
            name="color"
            control={form.control}
            defaultValue={props.defaultValue}
            render={({ field }) => (
                <div className="w-1/2">
                    <label
                        className="text-xs text-gray-500"
                        htmlFor={field.name}
                    >
                        Colore manto
                    </label>
                    <div className="p-inputgroup">
                        <Dropdown
                            {...field}
                            options={animalFurColorsQuery.data}
                            optionLabel="label"
                            optionValue="id"
                            placeholder="Seleziona"
                            emptyMessage="Nessun risultato"
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
                            <AddFurColorForm
                                onSuccess={(furColor: IntUtilItem) => {
                                    setValue("color", furColor.id)
                                    props.onAdd && props.onAdd(furColor)
                                    op.current?.hide()
                                }}
                            />
                        </div>
                    </OverlayPanel>
                </div>
            )}
        />
    )
}

export default ControlledFurColorsDropdown
