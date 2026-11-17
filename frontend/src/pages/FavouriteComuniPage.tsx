import React, { useMemo, useState } from "react"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { PageTitle } from "../components/typography"
import ComuneAutoComplete from "../components/forms/city/ComuneAutoComplete"
import { ComuneSchema } from "../models/city.schema"
import { useAllComuniQuery, useSetComuneFavouriteMutation } from "../queries"
import { toastService } from "../services/toast"

/**
 * Superuser page to choose the favourite comuni, which are suggested first
 * in every comune picker of the app.
 */
const FavouriteComuniPage: React.FC = () => {
    const comuniQuery = useAllComuniQuery()
    const favouriteMutation = useSetComuneFavouriteMutation()
    const [toAdd, setToAdd] = useState<string | null>(null)

    const favourites = useMemo(
        () => (comuniQuery.data ?? []).filter((c) => c.favourite),
        [comuniQuery.data],
    )

    const setFavourite = (comune: ComuneSchema, favourite: boolean) =>
        favouriteMutation.mutate(
            { code: comune.id, favourite },
            {
                onSuccess: () => {
                    toastService.showSuccess(
                        favourite
                            ? `${comune.name} aggiunto ai preferiti`
                            : `${comune.name} rimosso dai preferiti`,
                    )
                    if (favourite) setToAdd(null)
                },
            },
        )

    const comuneToAdd = comuniQuery.data?.find((c) => c.id === toAdd)

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <PageTitle>Comuni Preferiti</PageTitle>
                <p className="text-surface-600 mt-2">
                    I comuni preferiti compaiono per primi in tutti i campi di
                    selezione del comune (provenienza, residenza, nascita...).
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6 flex flex-col gap-6">
                <div className="flex items-end gap-3">
                    <ComuneAutoComplete
                        id="favourite-comune"
                        label="Aggiungi un comune"
                        value={toAdd}
                        onChange={setToAdd}
                        className="flex-grow"
                    />
                    <Button
                        label="Aggiungi ai preferiti"
                        icon="pi pi-star"
                        disabled={!comuneToAdd || comuneToAdd.favourite}
                        loading={favouriteMutation.isLoading}
                        onClick={() =>
                            comuneToAdd && setFavourite(comuneToAdd, true)
                        }
                    />
                </div>

                <DataTable
                    value={favourites}
                    loading={comuniQuery.isLoading}
                    dataKey="id"
                    className="p-datatable-sm"
                    emptyMessage="Nessun comune preferito"
                    pt={{
                        headerRow: {
                            className: "bg-surface-50 text-surface-700",
                        },
                        thead: { className: "bg-surface-50" },
                    }}
                >
                    <Column field="name" header="Comune" />
                    <Column field="provincia" header="Provincia" />
                    <Column field="id" header="Codice" className="font-mono" />
                    <Column
                        header="Azioni"
                        style={{ width: "6rem" }}
                        body={(c: ComuneSchema) => (
                            <Button
                                icon="pi pi-times"
                                rounded
                                text
                                severity="danger"
                                tooltip="Rimuovi dai preferiti"
                                tooltipOptions={{ position: "left" }}
                                aria-label={`Rimuovi ${c.name} dai preferiti`}
                                disabled={favouriteMutation.isLoading}
                                onClick={() => setFavourite(c, false)}
                            />
                        )}
                    />
                </DataTable>
            </div>
        </div>
    )
}

export default FavouriteComuniPage
