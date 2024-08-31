import { useQuery } from "react-query"
import UncontrolledInputText from "../forms/uncontrolled/UncontrolledInputText"
import { useState } from "react"
import { apiService } from "../../main"
import { Button } from "primereact/button"
import { Adopter } from "../../models/adopter.schema"
import AdopterCard from "./AdopterCard"

type ResultProps = {
    data: Adopter
    onSelected: (adopter: Adopter) => void
}
const SearchResult = (props: ResultProps) => {
    return (
        <div className="flex gap-4 w-full items-center">
            <div className="grow">
                <AdopterCard data={props.data} />
            </div>
            <Button
                severity="success"
                onClick={() => props.onSelected(props.data)}
            >
                Seleziona
            </Button>
        </div>
    )
}

type SearchAdopterProps = {
    onNoResultsCallback: () => void
    onSelected: (adopter: Adopter) => void
}
const SearchAdopter = (props: SearchAdopterProps) => {
    const [fiscalCode, setFiscalCode] = useState<string | null>(null)
    const [results, setResults] = useState<Adopter[]>([])

    const searchQuery = useQuery(["adopter", fiscalCode], {
        enabled: false,
        queryFn: () => apiService.searchAdopter({ fiscal_code: fiscalCode }!),
        onSuccess: (results) => {
            setResults(results.items)
            if (results.total == 0) {
                props.onNoResultsCallback()
            }
        },
    })
    return (
        <div>
            <div className="flex gap-1 items-end">
                <UncontrolledInputText
                    className="w-40"
                    label="Codice fiscale"
                    onChange={(v) => setFiscalCode(v)}
                />
                <Button className="py-2" onClick={() => searchQuery.refetch()}>
                    Cerca
                </Button>
            </div>
            <div className="flex gap-2 my-4 flex-col">
                {results.map((r) => (
                    <SearchResult
                        key={r.id}
                        data={r}
                        onSelected={() => {
                            setResults([])
                            props.onSelected(r)
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

export default SearchAdopter
