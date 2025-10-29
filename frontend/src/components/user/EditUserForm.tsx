import React, { useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { Checkbox } from "primereact/checkbox"
import { InputText } from "primereact/inputtext"
import { Password } from "primereact/password"
import { Toast } from "primereact/toast"
import { Divider } from "primereact/divider"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useMutation } from "react-query"
import { z } from "zod"
import { apiService } from "../../main"
import { ManagementUser } from "../../models/user.schema"
import { useAuth } from "../../contexts/AuthContext"

const editUserSchema = z.object({
    name: z.string().optional(),
    surname: z.string().optional(),
    email: z.string().email("Email non valida"),
    is_superuser: z.boolean(),
    is_active: z.boolean(),
})

const changePasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(6, "La password deve essere di almeno 6 caratteri"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Le password non coincidono",
        path: ["confirmPassword"],
    })

type EditUserFormData = z.infer<typeof editUserSchema>
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

interface EditUserFormProps {
    user: ManagementUser
    onUserUpdated: () => void
    onCancel: () => void
}

const EditUserForm: React.FC<EditUserFormProps> = ({
    user,
    onUserUpdated,
    onCancel,
}) => {
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const toast = useRef<Toast>(null)
    const { user: currentUser } = useAuth()

    const userForm = useForm<EditUserFormData>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            name: user.name || "",
            surname: user.surname || "",
            email: user.email,
            is_superuser: user.is_superuser,
            is_active: user.is_active,
        },
    })

    const passwordForm = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    })

    const updateUserMutation = useMutation(
        (data: EditUserFormData) => apiService.updateUser(user.id, data),
        {
            onSuccess: () => {
                toast.current?.show({
                    severity: "success",
                    summary: "Successo",
                    detail: "Utente aggiornato con successo",
                })
                onUserUpdated()
            },
            onError: (error: any) => {
                toast.current?.show({
                    severity: "error",
                    summary: "Errore",
                    detail:
                        error.message ||
                        "Errore durante l'aggiornamento dell'utente",
                })
            },
        }
    )

    const changePasswordMutation = useMutation(
        (data: { newPassword: string }) => {
            // Use admin method if current user is superuser, otherwise use regular method
            if (currentUser?.is_superuser) {
                return apiService.changeUserPasswordAsAdmin(user.id, data.newPassword)
            } else {
                // This case shouldn't happen as non-superusers shouldn't be able to edit other users
                throw new Error("Non autorizzato a cambiare questa password")
            }
        },
        {
            onSuccess: () => {
                toast.current?.show({
                    severity: "success",
                    summary: "Successo",
                    detail: "Password cambiata con successo",
                })
                passwordForm.reset()
                setShowPasswordForm(false)
            },
            onError: (error: any) => {
                toast.current?.show({
                    severity: "error",
                    summary: "Errore",
                    detail:
                        error.message || "Errore durante il cambio password",
                })
            },
        }
    )

    const onSubmitUser = (data: EditUserFormData) => {
        updateUserMutation.mutate(data)
    }

    const onSubmitPassword = (data: ChangePasswordFormData) => {
        changePasswordMutation.mutate({ newPassword: data.newPassword })
    }

    return (
        <>
            <Toast ref={toast} />

            <div className="space-y-6">
                {/* User Info Form */}
                <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                        Informazioni Utente
                    </h3>

                    <FormProvider {...userForm}>
                        <form
                            onSubmit={userForm.handleSubmit(onSubmitUser)}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nome */}
                                <div className="field">
                                    <label
                                        htmlFor="edit-name"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Nome
                                    </label>
                                    <Controller
                                        name="name"
                                        control={userForm.control}
                                        render={({ field }) => (
                                            <InputText
                                                id="edit-name"
                                                {...field}
                                                className={`w-full ${
                                                    userForm.formState.errors
                                                        .name
                                                        ? "p-invalid"
                                                        : ""
                                                }`}
                                                placeholder="Inserisci il nome"
                                            />
                                        )}
                                    />
                                    {userForm.formState.errors.name && (
                                        <small className="p-error">
                                            {
                                                userForm.formState.errors.name
                                                    .message
                                            }
                                        </small>
                                    )}
                                </div>

                                {/* Cognome */}
                                <div className="field">
                                    <label
                                        htmlFor="edit-surname"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Cognome
                                    </label>
                                    <Controller
                                        name="surname"
                                        control={userForm.control}
                                        render={({ field }) => (
                                            <InputText
                                                id="edit-surname"
                                                {...field}
                                                className={`w-full ${
                                                    userForm.formState.errors
                                                        .surname
                                                        ? "p-invalid"
                                                        : ""
                                                }`}
                                                placeholder="Inserisci il cognome"
                                            />
                                        )}
                                    />
                                    {userForm.formState.errors.surname && (
                                        <small className="p-error">
                                            {
                                                userForm.formState.errors
                                                    .surname.message
                                            }
                                        </small>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="field">
                                <label
                                    htmlFor="edit-email"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Email
                                </label>
                                <Controller
                                    name="email"
                                    control={userForm.control}
                                    render={({ field }) => (
                                        <InputText
                                            id="edit-email"
                                            {...field}
                                            type="email"
                                            className={`w-full ${
                                                userForm.formState.errors.email
                                                    ? "p-invalid"
                                                    : ""
                                            }`}
                                            placeholder="Inserisci l'email"
                                        />
                                    )}
                                />
                                {userForm.formState.errors.email && (
                                    <small className="p-error">
                                        {
                                            userForm.formState.errors.email
                                                .message
                                        }
                                    </small>
                                )}
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
                                            control={userForm.control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    inputId="edit-is_active"
                                                    checked={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.checked
                                                        )
                                                    }
                                                    className="mr-2"
                                                />
                                            )}
                                        />
                                        <label
                                            htmlFor="edit-is_active"
                                            className="text-sm"
                                        >
                                            Utente attivo
                                        </label>
                                    </div>

                                    <div className="flex align-items-center">
                                        <Controller
                                            name="is_superuser"
                                            control={userForm.control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    inputId="edit-is_superuser"
                                                    checked={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.checked
                                                        )
                                                    }
                                                    className="mr-2"
                                                />
                                            )}
                                        />
                                        <label
                                            htmlFor="edit-is_superuser"
                                            className="text-sm"
                                        >
                                            Amministratore (Super User)
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="submit"
                                    label="Aggiorna Utente"
                                    loading={updateUserMutation.isLoading}
                                />
                            </div>
                        </form>
                    </FormProvider>
                </div>

                <Divider />

                {/* Password Form */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-800">
                            Cambia Password
                        </h3>
                        <Button
                            type="button"
                            label={
                                showPasswordForm
                                    ? "Nascondi"
                                    : "Cambia Password"
                            }
                            className="p-button-outlined p-button-sm"
                            onClick={() =>
                                setShowPasswordForm(!showPasswordForm)
                            }
                        />
                    </div>

                    {showPasswordForm && (
                        <FormProvider {...passwordForm}>
                            <form
                                onSubmit={passwordForm.handleSubmit(
                                    onSubmitPassword
                                )}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Nuova Password */}
                                    <div className="field">
                                        <label
                                            htmlFor="new-password"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Nuova Password
                                        </label>
                                        <Controller
                                            name="newPassword"
                                            control={passwordForm.control}
                                            render={({ field }) => (
                                                <Password
                                                    id="new-password"
                                                    {...field}
                                                    className={`w-full ${
                                                        passwordForm.formState
                                                            .errors.newPassword
                                                            ? "p-invalid"
                                                            : ""
                                                    }`}
                                                    placeholder="Inserisci la nuova password"
                                                    toggleMask
                                                    feedback={false}
                                                />
                                            )}
                                        />
                                        {passwordForm.formState.errors
                                            .newPassword && (
                                            <small className="p-error">
                                                {
                                                    passwordForm.formState
                                                        .errors.newPassword
                                                        .message
                                                }
                                            </small>
                                        )}
                                    </div>

                                    {/* Conferma Password */}
                                    <div className="field">
                                        <label
                                            htmlFor="confirm-new-password"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Conferma Password
                                        </label>
                                        <Controller
                                            name="confirmPassword"
                                            control={passwordForm.control}
                                            render={({ field }) => (
                                                <Password
                                                    id="confirm-new-password"
                                                    {...field}
                                                    className={`w-full ${
                                                        passwordForm.formState
                                                            .errors
                                                            .confirmPassword
                                                            ? "p-invalid"
                                                            : ""
                                                    }`}
                                                    placeholder="Conferma la nuova password"
                                                    toggleMask
                                                    feedback={false}
                                                />
                                            )}
                                        />
                                        {passwordForm.formState.errors
                                            .confirmPassword && (
                                            <small className="p-error">
                                                {
                                                    passwordForm.formState
                                                        .errors.confirmPassword
                                                        .message
                                                }
                                            </small>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        label="Annulla"
                                        className="p-button-outlined"
                                        onClick={() => {
                                            passwordForm.reset()
                                            setShowPasswordForm(false)
                                        }}
                                    />
                                    <Button
                                        type="submit"
                                        label="Cambia Password"
                                        severity="warning"
                                        loading={
                                            changePasswordMutation.isLoading
                                        }
                                    />
                                </div>
                            </form>
                        </FormProvider>
                    )}
                </div>

                <Divider />

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        label="Annulla"
                        className="p-button-outlined"
                        onClick={onCancel}
                    />
                </div>
            </div>
        </>
    )
}

export default EditUserForm
