import React, { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    ChangePassword,
    changePasswordSchema,
    ManagementUser,
} from "../models/user.schema"
import { apiService } from "../main"

const ProfilePage: React.FC = () => {
    const { user, logout } = useAuth()
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false)
    const [passwordChangeError, setPasswordChangeError] = useState<
        string | null
    >(null)
    const [currentUserDetails, setCurrentUserDetails] =
        useState<ManagementUser | null>(null)
    const [loadingUserDetails, setLoadingUserDetails] = useState(true)

    useEffect(() => {
        const loadUserDetails = async () => {
            try {
                const userDetails = await apiService.getCurrentUser()
                setCurrentUserDetails(userDetails)
            } catch (error) {
                console.error("Failed to load user details:", error)
                // Fallback to basic user info from context
            } finally {
                setLoadingUserDetails(false)
            }
        }

        if (user) {
            loadUserDetails()
        }
    }, [user])

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ChangePassword>({
        resolver: zodResolver(changePasswordSchema),
    })

    const onPasswordChange = async (data: ChangePassword) => {
        try {
            setPasswordChangeError(null)
            setPasswordChangeSuccess(false)

            if (!currentUserDetails?.id) {
                throw new Error("ID utente non disponibile")
            }

            // Use the actual API call with current password verification
            await apiService.changeUserPassword(
                currentUserDetails.id,
                data.currentPassword,
                data.newPassword
            )

            setPasswordChangeSuccess(true)
            reset()

            // Optionally log out user to force re-login with new password
            setTimeout(() => {
                logout()
            }, 2000)
        } catch (error) {
            setPasswordChangeError(
                error instanceof Error
                    ? error.message
                    : "Impossibile cambiare la password"
            )
        }
    }

    const handleDeleteAccount = async () => {
        if (
            window.confirm(
                "Sei sicuro di voler eliminare il tuo account? Questa azione non può essere annullata."
            )
        ) {
            try {
                // Implement account deletion logic here
                // await apiService.deleteCurrentUser()
                alert(
                    "La funzionalità di eliminazione account verrà implementata"
                )
            } catch (error) {
                alert("Impossibile eliminare l'account")
            }
        }
    }

    if (!user || loadingUserDetails) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">
                    Caricamento informazioni utente...
                </div>
            </div>
        )
    }

    // Use detailed user info if available, otherwise fall back to basic user info
    const displayUser = currentUserDetails || user

    return (
        <div className="max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="bg-white shadow rounded-lg mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Impostazioni Profilo
                    </h1>
                    <p className="mt-1 text-gray-600">
                        Gestisci le impostazioni del tuo account e le preferenze
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* User Information Card */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">
                                Informazioni Utente
                            </h2>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nome Utente
                                </label>
                                <div className="mt-1 p-3 bg-gray-50 rounded-md text-gray-900">
                                    {"username" in displayUser
                                        ? displayUser.username
                                        : displayUser.email}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <div className="mt-1 p-3 bg-gray-50 rounded-md text-gray-900">
                                    {displayUser.email || "Non disponibile"}
                                </div>
                            </div>
                            {currentUserDetails?.name && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nome
                                    </label>
                                    <div className="mt-1 p-3 bg-gray-50 rounded-md text-gray-900">
                                        {currentUserDetails.name}
                                    </div>
                                </div>
                            )}
                            {currentUserDetails?.surname && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Cognome
                                    </label>
                                    <div className="mt-1 p-3 bg-gray-50 rounded-md text-gray-900">
                                        {currentUserDetails.surname}
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Ruolo
                                </label>
                                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            displayUser.is_superuser
                                                ? "bg-purple-100 text-purple-800"
                                                : "bg-green-100 text-green-800"
                                        }`}
                                    >
                                        {displayUser.is_superuser
                                            ? "Amministratore"
                                            : "Utente"}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Stato
                                </label>
                                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            currentUserDetails?.is_active !==
                                            false
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {currentUserDetails?.is_active !== false
                                            ? "Attivo"
                                            : "Inattivo"}
                                    </span>
                                </div>
                            </div>
                            {currentUserDetails?.created_at && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Membro dal
                                    </label>
                                    <div className="mt-1 p-3 bg-gray-50 rounded-md text-gray-900">
                                        {new Date(
                                            currentUserDetails.created_at
                                        ).toLocaleDateString("it-IT")}
                                    </div>
                                </div>
                            )}
                            {currentUserDetails?.last_login && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Ultimo Accesso
                                    </label>
                                    <div className="mt-1 p-3 bg-gray-50 rounded-md text-gray-900">
                                        {new Date(
                                            currentUserDetails.last_login
                                        ).toLocaleString("it-IT")}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">
                                Cambia Password
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Aggiorna la tua password per mantenere il tuo
                                account sicuro
                            </p>
                        </div>
                        <div className="px-6 py-4">
                            {passwordChangeSuccess && (
                                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg
                                                className="h-5 w-5 text-green-400"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-green-800">
                                                Password cambiata con successo!
                                                Verrai disconnesso tra pochi
                                                secondi.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {passwordChangeError && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg
                                                className="h-5 w-5 text-red-400"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-red-800">
                                                {passwordChangeError}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit(onPasswordChange)}
                                className="space-y-4"
                            >
                                <div>
                                    <label
                                        htmlFor="currentPassword"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Password Attuale
                                    </label>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        {...register("currentPassword")}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        disabled={isSubmitting}
                                    />
                                    {errors.currentPassword && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.currentPassword.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="newPassword"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Nuova Password
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        {...register("newPassword")}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        disabled={isSubmitting}
                                    />
                                    {errors.newPassword && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.newPassword.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Conferma Nuova Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        {...register("confirmPassword")}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        disabled={isSubmitting}
                                    />
                                    {errors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.confirmPassword.message}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting
                                            ? "Cambio in corso..."
                                            : "Cambia Password"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                {/* <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">
                                Azioni Rapide
                            </h2>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <button
                                onClick={logout}
                                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Disconnetti
                            </button>
                        </div>
                    </div>

                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">
                                Gestione Account
                            </h2>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div className="text-sm text-gray-600">
                                <p>
                                    Hai bisogno di aggiornare la tua email o
                                    altri dettagli dell'account?
                                </p>
                                <p className="mt-2">
                                    Contatta il tuo amministratore per
                                    assistenza.
                                </p>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="text-sm font-medium text-red-600 mb-2">
                                    Zona Pericolosa
                                </h3>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="w-full inline-flex justify-center py-2 px-4 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Elimina Account
                                </button>
                                <p className="mt-2 text-xs text-gray-500">
                                    Questa azione non può essere annullata
                                </p>
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    )
}

export default ProfilePage
