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
        <div className="group">
            <AdopterCard 
                data={props.data} 
                variant="compact"
                interactive={true}
                onClick={() => props.onSelected(props.data)}
            />
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

    const handleSearch = () => {
        if (fiscalCode && fiscalCode.length >= 3) {
            searchQuery.refetch()
        }
    }

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex gap-3 items-end">
                    <div className="flex-1">
                        <UncontrolledInputText
                            label="Codice Fiscale (min 3 caratteri)"
                            onChange={(v) => setFiscalCode(v)}
                        />
                    </div>
                    <Button 
                        onClick={handleSearch}
                        disabled={!fiscalCode || fiscalCode.length < 3}
                        loading={searchQuery.isLoading}
                        className="px-6"
                    >
                        Cerca
                    </Button>
                </div>
            </div>

            {/* Search Results */}
            {results.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">
                        Risultati ({results.length})
                    </h4>
                    <div className="space-y-2">
                        {results.map((r) => (
                            <SearchResult
                                key={r.id}
                                data={r}
                                onSelected={() => {
                                    setResults([])
                                    setFiscalCode(null)
                                    props.onSelected(r)
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* No Results Message */}
            {searchQuery.isSuccess && results.length === 0 && fiscalCode && (
                <div className="text-center py-6 text-gray-500">
                    <p className="mb-2">Nessun adottante trovato con questo codice fiscale</p>
                    <p className="text-sm">Prova con un codice fiscale diverso o aggiungi un nuovo adottante</p>
                </div>
            )}

            {/* Loading State */}
            {searchQuery.isLoading && (
                <div className="text-center py-6 text-gray-500">
                    <p>Ricerca in corso...</p>
                </div>
            )}
        </div>
    )
}

export default SearchAdopter
