import { Dropdown } from "primereact/dropdown"
import { Controller, useFormContext } from "react-hook-form"
import { useQuery } from "react-query"
import { apiService } from "../../main"
import { classNames } from "primereact/utils"
import { Button } from "primereact/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { OverlayPanel } from "primereact/overlaypanel"
import { useRef } from "react"
import AddBreedForm from "../AddBreedForm"
import { Breed } from "../../models/breed.schema"
import { useBreedsQuery } from "../../queries"

type Props = {
    raceId?: string
    className?: string
    defaultValue?: number
    onAddBreed?: (breed: Breed) => void
}
const ControlledBreedsDropdown = (props: Props) => {
    const breedsQuery = useBreedsQuery(props.raceId)
    const form = useFormContext<{ breed_id: number }>()
    const op = useRef<OverlayPanel>(null)

    const { setValue } = form
    return (
        <Controller
            name="breed_id"
            control={form.control}
            defaultValue={props.defaultValue}
            render={({ field }) => (
                <div className="w-1/2">
                    <label
                        className="text-xs text-gray-500"
                        htmlFor={field.name}
                    >
                        Razza
                    </label>
                    <div className="p-inputgroup">
                        <Dropdown
                            {...field}
                            options={breedsQuery.data}
                            optionLabel="name"
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
                            <AddBreedForm
                                raceId={props.raceId}
                                onSuccess={(breed: Breed) => {
                                    setValue("breed_id", breed.id)
                                    props.onAddBreed && props.onAddBreed(breed)
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

export default ControlledBreedsDropdown
