import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { Divider } from "primereact/divider"
import { Toast } from "primereact/toast"
import { Card } from "primereact/card"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Dialog } from "primereact/dialog"
import { useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "react-query"
import { Link, useParams } from "react-router-dom"
import { ApiErrorCode } from "../../constants"
import { apiService } from "../../main"
import {
    AnimalEditSuperUser,
    animalEditSuperUserSchema,
    Animal,
    AnimalEntry,
} from "../../models/animal.schema"
import { ApiError, apiErrorSchema } from "../../models/api.schema"
import {
    useAnimalFurTypesQuery,
    useAnimalQuery,
    useAnimalSizesQuery,
    useEntryTypesQuery,
    useExitTypesQuery,
} from "../../queries"
import ControlledBreedsDropdown from "../forms/ControlledBreedsDropdown"
import ControlledCheckbox from "../forms/ControlledCheckbox"
import ControlledDropdown from "../forms/ControlledDropdown"
import ControlledFurColorsDropdown from "../forms/ControlledFurColorDropdown"
import ControlledInputDate from "../forms/ControlledInputDate"
import ControlledInputMask from "../forms/ControlledInputMask"
import ControlledInputText from "../forms/ControlledInputText"
import ControlledRadio from "../forms/ControlledRadio"
import ControlledTextarea from "../forms/ControlledTextarea"

const SuperUserAnimalEditForm = () => {
    const { id } = useParams()
    const animalQuery = useAnimalQuery(id!)
    const animalSizesQuery = useAnimalSizesQuery()
    const animalFurTypesQuery = useAnimalFurTypesQuery()
    const entryTypesQuery = useEntryTypesQuery()
    const exitTypesQuery = useExitTypesQuery()

    // State for entry editing
    const [showEntryDialog, setShowEntryDialog] = useState(false)
    const [editingEntry, setEditingEntry] = useState<AnimalEntry | null>(null)

    const form = useForm<AnimalEditSuperUser>({
        resolver: zodResolver(animalEditSuperUserSchema),
        defaultValues: {
            ...animalEditSuperUserSchema.parse(animalQuery.data),
        },
    })
    const toast = useRef<Toast>(null)

    const {
        formState: { isDirty },
        handleSubmit,
        reset,
        setValue,
    } = form

    const queryClient = useQueryClient()

    const updateAnimalMutation = useMutation({
        mutationFn: (args: { id: string; data: AnimalEditSuperUser }) =>
            apiService.updateAnimal(args.id, args.data),
        onSuccess: (
            result: boolean | ApiError,
            variables: { id: string; data: AnimalEditSuperUser }
        ) => {
            const isApiError = apiErrorSchema.safeParse(result)
            if (isApiError.success) {
                if (isApiError.data.code == ApiErrorCode.existingChipCode) {
                    const otherAnimalId = isApiError.data.content!.animal_id
                    toast.current?.show({
                        severity: "warn",
                        sticky: true,
                        content: (
                            <div className="flex gap-3 w-full items-start">
                                <i className="text-[2rem] pi pi-exclamation-triangle" />
                                <div className="flex flex-col gap-1 w-full">
                                    <span className="p-toast-summary">
                                        Chip già esistente
                                    </span>
                                    <Link
                                        className="underline"
                                        to={"/animal/" + otherAnimalId}
                                    >
                                        Vai alla scheda dell'animale
                                    </Link>
                                </div>
                            </div>
                        ),
                    })
                }
                return
            }
            queryClient.invalidateQueries({
                queryKey: ["animal-search"],
            })
            queryClient.setQueryData(
                ["animal", variables.id],
                //@ts-ignore: types Updater and Animal are not compatible
                (old: Animal) => ({
                    ...old,
                    ...variables.data,
                })
            )
            toast.current?.show({
                severity: "success",
                summary: "Scheda aggiornata (Super User)",
            })
            reset(variables.data)
        },
        onError: () =>
            toast.current?.show({
                severity: "error",
                summary: "Qualcosa è andato storto",
            }),
        mutationKey: "update-animal-superuser",
    })

    const onSubmit = async (data: AnimalEditSuperUser) => {
        if (!id) {
            return false
        }
        await updateAnimalMutation.mutateAsync({ id, data })
    }

    // Handler functions for entry management
    const handleAddEntry = () => {
        setEditingEntry(null)
        setShowEntryDialog(true)
    }

    const handleEditEntry = (entry: AnimalEntry) => {
        setEditingEntry(entry)
        setShowEntryDialog(true)
    }

    const handleDeleteEntry = (entry: AnimalEntry) => {
        // TODO: Implement delete functionality
        console.log("Delete entry:", entry)
    }

    // Animal stage options
    const animalStages = [
        { id: "A", label: "Adulto" },
        { id: "C", label: "Cucciolo" },
        { id: "G", label: "Giovane" },
    ]

    // Adoptability index options
    const adoptabilityIndexOptions = [
        { id: 0, label: "0 - Non adottabile" },
        { id: 1, label: "1 - Adottabilità limitata" },
        { id: 2, label: "2 - Adottabile con riserve" },
        { id: 3, label: "3 - Completamente adottabile" },
    ]

    return (
        <div className="max-w-6xl">
            <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                <div className="flex items-center">
                    <i className="pi pi-exclamation-triangle mr-2"></i>
                    <span className="font-semibold">Modalità Super User</span>
                </div>
                <p className="text-sm mt-1">
                    Stai utilizzando il modulo avanzato con accesso a tutti i
                    campi amministrativi.
                </p>
            </div>

            <FormProvider {...form}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Information Card */}
                        <Card title="Informazioni di Base" className="h-fit">
                            <div className="flex flex-col gap-4">
                                <ControlledInputText<AnimalEditSuperUser>
                                    fieldName="name"
                                    label="Nome"
                                    className="w-full"
                                />
                                <ControlledInputMask<AnimalEditSuperUser>
                                    fieldName="chip_code"
                                    label="Chip"
                                    mask="999.999.999.999.999"
                                    disabled={animalQuery.data?.chip_code_set}
                                    className="w-full"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <ControlledCheckbox<AnimalEditSuperUser>
                                        fieldName="sterilized"
                                        label="Sterilizzato"
                                    />
                                    <ControlledCheckbox<AnimalEditSuperUser>
                                        fieldName="adoptable"
                                        label="Adottabile"
                                    />
                                </div>
                                <ControlledRadio<AnimalEditSuperUser, number>
                                    fieldName="sex"
                                    values={[
                                        { value: 0, label: "Maschio" },
                                        { value: 1, label: "Femmina" },
                                    ]}
                                />
                                <ControlledInputDate<AnimalEditSuperUser>
                                    fieldName="birth_date"
                                    label="Data di nascita"
                                    className="w-full"
                                />
                            </div>
                        </Card>

                        {/* Administrative Fields Card */}
                        <Card title="Campi Amministrativi" className="h-fit">
                            <div className="flex flex-col gap-4">
                                <ControlledDropdown
                                    fieldName="stage"
                                    label="Stadio"
                                    optionValue="id"
                                    optionLabel="label"
                                    options={animalStages}
                                    placeholder="Seleziona stadio"
                                />
                                <ControlledDropdown
                                    fieldName="adoptability_index"
                                    label="Indice di Adottabilità"
                                    optionValue="id"
                                    optionLabel="label"
                                    options={adoptabilityIndexOptions}
                                    placeholder="Seleziona indice"
                                />
                                <ControlledInputText<AnimalEditSuperUser>
                                    fieldName="img_path"
                                    label="Percorso Immagine"
                                    className="w-full"
                                />
                            </div>
                        </Card>

                        {/* Physical Characteristics Card */}
                        <Card title="Caratteristiche Fisiche" className="h-fit">
                            <div className="flex flex-col gap-4">
                                <ControlledBreedsDropdown
                                    raceId={animalQuery.data?.race_id}
                                    onAddBreed={(breed) =>
                                        setValue("breed_id", breed.id, {
                                            shouldDirty: true,
                                        })
                                    }
                                />
                                <div className="grid grid-cols-1 gap-4">
                                    <ControlledDropdown
                                        fieldName="size"
                                        label="Taglia"
                                        optionValue="id"
                                        optionLabel="label"
                                        options={animalSizesQuery.data}
                                    />
                                    <ControlledDropdown
                                        fieldName="fur"
                                        label="Pelo"
                                        optionValue="id"
                                        optionLabel="label"
                                        options={animalFurTypesQuery.data}
                                    />
                                    <ControlledFurColorsDropdown
                                        onAdd={(color) =>
                                            setValue("color", color.id, {
                                                shouldDirty: true,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Entry/Exit Information Card (Read-only) */}
                        <Card
                            title="Informazioni Ingresso/Uscita"
                            className="h-fit"
                        >
                            <div className="flex flex-col gap-4">
                                <div className="text-sm text-gray-600 mb-2">
                                    <i className="pi pi-info-circle mr-1"></i>
                                    Questi campi sono di sola visualizzazione
                                </div>
                                <ControlledInputDate<AnimalEditSuperUser>
                                    fieldName="entry_date"
                                    label="Data Ingresso"
                                    disabled={true}
                                    className="w-full"
                                />
                                <ControlledDropdown
                                    fieldName="entry_type"
                                    label="Tipo Ingresso"
                                    optionValue="id"
                                    optionLabel="label"
                                    options={entryTypesQuery.data}
                                    disabled={true}
                                />
                                <ControlledInputDate<AnimalEditSuperUser>
                                    fieldName="exit_date"
                                    label="Data Uscita"
                                    disabled={true}
                                    className="w-full"
                                />
                                <ControlledDropdown
                                    fieldName="exit_type"
                                    label="Tipo Uscita"
                                    optionValue="id"
                                    optionLabel="label"
                                    options={exitTypesQuery.data}
                                    disabled={true}
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Notes Section */}
                    <Card title="Note" className="mt-6">
                        <ControlledTextarea<AnimalEditSuperUser>
                            fieldName="notes"
                            label="Note"
                            className="w-full"
                        />
                    </Card>

                    {/* Animal Entries History Section */}
                    <Card title="Storico Entrate/Uscite" className="mt-6">
                        <div className="mb-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    <i className="pi pi-info-circle mr-1"></i>
                                    Storico completo di tutte le entrate e
                                    uscite dell'animale
                                </div>
                                <Button
                                    type="button"
                                    outlined
                                    size="small"
                                    className="p-button-sm"
                                    onClick={handleAddEntry}
                                >
                                    <i className="pi pi-plus mr-2"></i>
                                    Aggiungi Ingresso
                                </Button>
                            </div>
                        </div>

                        {animalQuery.data?.entries &&
                        animalQuery.data.entries.length > 0 ? (
                            <DataTable
                                value={animalQuery.data.entries}
                                size="small"
                                stripedRows
                                className="p-datatable-sm"
                            >
                                <Column
                                    field="entry_id"
                                    header="ID"
                                    style={{ width: "80px" }}
                                />
                                <Column
                                    field="entry_date"
                                    header="Data Ingresso"
                                    body={(rowData: AnimalEntry) =>
                                        rowData.entry_date
                                            ? new Date(
                                                  rowData.entry_date
                                              ).toLocaleDateString("it-IT")
                                            : "-"
                                    }
                                />
                                <Column
                                    field="entry_type"
                                    header="Tipo Ingresso"
                                />
                                <Column
                                    field="exit_date"
                                    header="Data Uscita"
                                    body={(rowData: AnimalEntry) =>
                                        rowData.exit_date
                                            ? new Date(
                                                  rowData.exit_date
                                              ).toLocaleDateString("it-IT")
                                            : "Presente"
                                    }
                                />
                                <Column
                                    field="exit_type"
                                    header="Tipo Uscita"
                                    body={(rowData: AnimalEntry) =>
                                        rowData.exit_type || "-"
                                    }
                                />
                                <Column
                                    header="Azioni"
                                    style={{ width: "120px" }}
                                    body={(rowData: AnimalEntry) => (
                                        <div className="flex gap-2">
                                            <Button
                                                icon="pi pi-pencil"
                                                size="small"
                                                outlined
                                                tooltip="Modifica"
                                                onClick={() =>
                                                    handleEditEntry(rowData)
                                                }
                                            />
                                            <Button
                                                icon="pi pi-trash"
                                                size="small"
                                                outlined
                                                severity="danger"
                                                tooltip="Elimina"
                                                onClick={() =>
                                                    handleDeleteEntry(rowData)
                                                }
                                            />
                                        </div>
                                    )}
                                />
                            </DataTable>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <i className="pi pi-inbox text-4xl block mb-4"></i>
                                <p>
                                    Nessun ingresso registrato per questo
                                    animale.
                                </p>
                                <Button
                                    type="button"
                                    outlined
                                    className="mt-3"
                                    onClick={handleAddEntry}
                                >
                                    <i className="pi pi-plus mr-2"></i>
                                    Aggiungi Primo Ingresso
                                </Button>
                            </div>
                        )}
                    </Card>

                    <Divider />

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4">
                        <div className="text-sm text-gray-600">
                            {isDirty
                                ? "Ci sono modifiche non salvate"
                                : "Nessuna modifica"}
                        </div>
                        <Button
                            disabled={
                                !isDirty || updateAnimalMutation.isLoading
                            }
                            loading={updateAnimalMutation.isLoading}
                            type="submit"
                            size="large"
                            className="bg-yellow-600 border-yellow-600"
                        >
                            <i className="pi pi-save mr-2"></i>
                            Salva (Super User)
                        </Button>
                    </div>
                </form>
            </FormProvider>

            {/* Entry Edit Dialog */}
            <Dialog
                header={editingEntry ? "Modifica Ingresso" : "Nuovo Ingresso"}
                visible={showEntryDialog}
                onHide={() => setShowEntryDialog(false)}
                style={{ width: "500px" }}
                modal
            >
                <div className="p-4">
                    <div className="text-center text-gray-500">
                        <i className="pi pi-wrench text-3xl block mb-3"></i>
                        <p>
                            Funzionalità di modifica delle entrate in sviluppo.
                        </p>
                        <p className="text-sm mt-2">
                            Questa sezione permetterà di aggiungere, modificare
                            ed eliminare gli ingressi e le uscite degli animali.
                        </p>
                        <Button
                            label="Chiudi"
                            className="mt-4"
                            onClick={() => setShowEntryDialog(false)}
                        />
                    </div>
                </div>
            </Dialog>

            <Toast ref={toast} position="bottom-right" />
        </div>
    )
}

export default SuperUserAnimalEditForm
