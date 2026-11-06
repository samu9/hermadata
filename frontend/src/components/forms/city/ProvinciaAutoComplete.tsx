import { ProvinciaSchema } from "../../../models/city.schema"
import { useProvinceQuery } from "../../../queries"
import { searchProvince } from "../../../utils/citySearch"
import CityAutoComplete, { CityAutoCompleteProps } from "./CityAutoComplete"

const provinciaTemplate = (p: ProvinciaSchema) => (
    <div className="flex justify-between gap-3">
        <span>{p.name}</span>
        <span className="text-surface-400">{p.id}</span>
    </div>
)

/** Provincia picker with fuzzy search on name and sigla. */
const ProvinciaAutoComplete = (props: CityAutoCompleteProps) => {
    const provinceQuery = useProvinceQuery()

    return (
        <CityAutoComplete
            {...props}
            label={props.label ?? "Provincia"}
            placeholder={props.placeholder ?? "Cerca provincia"}
            items={provinceQuery.data ?? []}
            loading={provinceQuery.isLoading}
            search={searchProvince}
            itemTemplate={provinciaTemplate}
        />
    )
}

export default ProvinciaAutoComplete
