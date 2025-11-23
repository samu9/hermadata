import React, { useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { Card } from "primereact/card"
import { Checkbox } from "primereact/checkbox"
import { InputText } from "primereact/inputtext"
import { Password } from "primereact/password"
import { Toast } from "primereact/toast"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useMutation } from "react-query"
import { z } from "zod"
import { apiService } from "../../main"
import { CreateUser } from "../../models/user.schema"
import { useRolesQuery } from "../../queries"
import ControlledDropdown from "../forms/ControlledDropdown"

const createUserSchema = z
    .object({
        name: z.string().optional(),
        surname: z.string().optional(),
        email: z.string().email("Email non valida"),
        password: z
            .string()
            .min(6, "La password deve essere di almeno 6 caratteri"),
        confirmPassword: z.string(),
        role_name: z.string().min(1, "Seleziona un ruolo"),
        is_superuser: z.boolean().default(false),
        is_active: z.boolean().default(true),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Le password non coincidono",
        path: ["confirmPassword"],
    })

type CreateUserForm = z.infer<typeof createUserSchema>

interface CreateUserFormProps {
    onUserCreated?: () => void
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onUserCreated }) => {
    const toast = useRef<Toast>(null)
    const { data: roles, isLoading: rolesLoading } = useRolesQuery()

    const form = useForm<CreateUserForm>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            surname: "",
            email: "",
            password: "",
            confirmPassword: "",
            role_name: "",
            is_superuser: false,
            is_active: true,
        },
    })

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = form

    const createUserMutation = useMutation(
        (data: CreateUser) => apiService.createUser(data),
        {
            onSuccess: () => {
                toast.current?.show({
                    severity: "success",
                    summary: "Successo",
                    detail: "Utente creato con successo",
                })
                reset()
                onUserCreated?.()
            },
            onError: (error: any) => {},
        }
    )

    const onSubmit = (data: CreateUserForm) => {
        const { confirmPassword, ...userData } = data
        createUserMutation.mutate(userData)
    }

    return (
        <>
            <Toast ref={toast} />

            <Card className="mt-0">
                <div className="mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        Crea Nuovo Utente
                    </h2>
                    <p className="text-gray-600">
                        Inserisci i dati per creare un nuovo utente del sistema
                    </p>
                </div>

                <FormProvider {...form}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nome */}
                            <div className="field">
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Nome
                                </label>
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <InputText
                                            id="name"
                                            {...field}
                                            className={`w-full ${
                                                errors.name ? "p-invalid" : ""
                                            }`}
                                            placeholder="Inserisci il nome"
                                        />
                                    )}
                                />
                                {errors.name && (
                                    <small className="p-error">
                                        {errors.name.message}
                                    </small>
                                )}
                            </div>

                            {/* Cognome */}
                            <div className="field">
                                <label
                                    htmlFor="surname"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Cognome
                                </label>
                                <Controller
                                    name="surname"
                                    control={control}
                                    render={({ field }) => (
                                        <InputText
                                            id="surname"
                                            {...field}
                                            className={`w-full ${
                                                errors.surname
                                                    ? "p-invalid"
                                                    : ""
                                            }`}
                                            placeholder="Inserisci il cognome"
                                        />
                                    )}
                                />
                                {errors.surname && (
                                    <small className="p-error">
                                        {errors.surname.message}
                                    </small>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="field">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email *
                            </label>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <InputText
                                        id="email"
                                        {...field}
                                        type="email"
                                        className={`w-full ${
                                            errors.email ? "p-invalid" : ""
                                        }`}
                                        placeholder="Inserisci l'email"
                                    />
                                )}
                            />
                            {errors.email && (
                                <small className="p-error">
                                    {errors.email.message}
                                </small>
                            )}
                        </div>

                        {/* Ruolo */}
                        <ControlledDropdown
                            fieldName="role_name"
                            label="Ruolo *"
                            options={roles}
                            optionLabel="name"
                            optionValue="name"
                            placeholder="Seleziona un ruolo"
                            disabled={rolesLoading}
                            className="field"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Password */}
                            <div className="field">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Password *
                                </label>
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <Password
                                            id="password"
                                            {...field}
                                            className={`w-full ${
                                                errors.password
                                                    ? "p-invalid"
                                                    : ""
                                            }`}
                                            placeholder="Inserisci la password"
                                            toggleMask
                                            feedback={false}
                                        />
                                    )}
                                />
                                {errors.password && (
                                    <small className="p-error">
                                        {errors.password.message}
                                    </small>
                                )}
                            </div>

                            {/* Conferma Password */}
                            <div className="field">
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Conferma Password *
                                </label>
                                <Controller
                                    name="confirmPassword"
                                    control={control}
                                    render={({ field }) => (
                                        <Password
                                            id="confirmPassword"
                                            {...field}
                                            className={`w-full ${
                                                errors.confirmPassword
                                                    ? "p-invalid"
                                                    : ""
                                            }`}
                                            placeholder="Conferma la password"
                                            toggleMask
                                            feedback={false}
                                        />
                                    )}
                                />
                                {errors.confirmPassword && (
                                    <small className="p-error">
                                        {errors.confirmPassword.message}
                                    </small>
                                )}
                            </div>
                        </div>

                        {/* Autorizzazioni */}
                        <div className="field">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Autorizzazioni
                            </label>

                            <div className="flex flex-col gap-3">
                                <div className="flex align-items-center">
                                    <Controller
                                        name="is_active"
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                inputId="is_active"
                                                checked={field.value}
                                                onChange={(e) =>
                                                    field.onChange(e.checked)
                                                }
                                                className="mr-2"
                                            />
                                        )}
                                    />
                                    <label
                                        htmlFor="is_active"
                                        className="text-sm"
                                    >
                                        Utente attivo
                                    </label>
                                </div>

                                <div className="flex align-items-center">
                                    <Controller
                                        name="is_superuser"
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                inputId="is_superuser"
                                                checked={field.value}
                                                onChange={(e) =>
                                                    field.onChange(e.checked)
                                                }
                                                className="mr-2"
                                            />
                                        )}
                                    />
                                    <label
                                        htmlFor="is_superuser"
                                        className="text-sm"
                                    >
                                        Amministratore (Super User)
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Bottoni */}
                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                label="Reset"
                                className="p-button-outlined"
                                onClick={() => reset()}
                            />
                            <Button
                                type="submit"
                                label="Crea Utente"
                                loading={createUserMutation.isLoading}
                                disabled={!isValid}
                            />
                        </div>
                    </form>
                </FormProvider>
            </Card>
        </>
    )
}

export default CreateUserForm
