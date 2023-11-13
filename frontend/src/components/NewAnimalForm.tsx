import { useForm } from "react-hook-form"
import { apiService } from "../main"
import { NewAnimalSchema, newAnimalSchema } from "../models/new-animal.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"
import { useQuery } from "react-query"

const NewAnimalForm = () => {
    const {
        register,
        handleSubmit,
        watch,
        getValues,
        formState: { errors },
    } = useForm<NewAnimalSchema>({
        resolver: zodResolver(newAnimalSchema),
    })
    const [provincia, setProvincia] = useState<string>()
    const provinceQuery = useQuery("province", () => apiService.getProvince(), {
        placeholderData: [],
    })
    const racesQuery = useQuery("races", () => apiService.getRaces(), {
        placeholderData: [],
        staleTime: Infinity,
    })
    const comuniQuery = useQuery(
        ["comuni", provincia],
        () => (provincia && apiService.getComuni(provincia)) || [],
        {
            placeholderData: [],
            staleTime: Infinity,
        }
    )

    const onSubmit = async (data: NewAnimalSchema) => {
        console.log(data)
        // const result = await apiService.createAnimal(data)
        // return result
    }
    return (
        <div className="border border-primary p-2 rounded max-w-lg">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex gap-2">
                    <div className="form-control w-full max-w-xs">
                        <label className="label">
                            <span className="label-text">Provincia</span>
                        </label>
                        <select
                            className="select select-bordered w-full max-w-xs"
                            onChange={(e) => {
                                setProvincia(e.target.value)
                            }}
                        >
                            <option disabled selected>
                                Seleziona
                            </option>
                            {provinceQuery.data &&
                                provinceQuery.data.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="form-control w-full max-w-xs">
                        <label className="label">
                            <span className="label-text">Comune</span>
                        </label>
                        <select
                            className="select select-bordered w-full max-w-xs"
                            {...register("origin_city_code")}
                        >
                            {comuniQuery.data &&
                                comuniQuery.data.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="form-control w-full max-w-xs">
                        <label className="label">
                            <span className="label-text">Razza</span>
                        </label>
                        <select
                            className="select select-bordered w-full max-w-xs"
                            {...register("race")}
                        >
                            {racesQuery.data &&
                                racesQuery.data.map((p) => (
                                    <option key={p.code} value={p.code}>
                                        {p.name.toUpperCase()}
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>

                <div className="form-control w-full max-w-xs">
                    <label className="label">
                        <span className="label-text">Nome</span>
                    </label>
                    <input
                        {...register("name")}
                        type="text"
                        className="input input-bordered w-full max-w-xs"
                    />
                </div>

                <button className="btn btn-success">
                    <FontAwesomeIcon icon={faPlus} /> Salva
                </button>
            </form>
        </div>
    )
}
export default NewAnimalForm