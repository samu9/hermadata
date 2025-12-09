import { faRightToBracket } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { Card } from "primereact/card"
import { FormProvider, useForm } from "react-hook-form"
import { useMutation } from "react-query"
import { Login, loginSchema } from "../../models/user.schema"
import ControlledInputText from "../forms/ControlledInputText"
import ControlledInputPassword from "../forms/ControlledInputPassword"
import { useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
// import HermaDataLogo from "../HermaDataLogo"
import logo from "../../assets/hermadata.svg"
const LoginForm = () => {
    const form = useForm<Login>({
        resolver: zodResolver(loginSchema),
    })
    const { login } = useAuth()
    const navigate = useNavigate()

    const {
        handleSubmit,
        formState: { isValid, errors },
        watch,
    } = form

    useEffect(() => {
        console.log(errors, isValid)
    }, [watch()])

    // React Query Mutation for API call
    const loginMutation = useMutation({
        mutationFn: async (request: Login) => {
            const success = await login(request.username, request.password)
            if (!success) {
                throw new Error("Login failed")
            }
            return success
        },
        onSuccess: () => {
            console.log("logged")
            navigate("/")
        },
        mutationKey: "login",
    })

    // Handle form submission
    const onSubmit = async (data: Login) => {
        const validated = loginSchema.parse(data)
        loginMutation.mutateAsync(validated)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-surface-200 overflow-hidden">
                <div className="flex flex-col items-center gap-4 pt-10 pb-6 px-8">
                    <img src={logo} alt="HermaData Logo" className="w-24" />
                    <div className="text-center">
                        <span className="text-3xl text-primary-700 font-bold tracking-tight">
                            HERMADATA
                        </span>
                        <p className="text-sm text-surface-500 mt-1">
                            Animal Shelter Management System
                        </p>
                    </div>
                </div>
                {/* Form Section */}
                <div className="p-8 pt-2">
                    <FormProvider {...form}>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <ControlledInputText<Login>
                                fieldName="username"
                                label="Email o Username"
                            />

                            <ControlledInputPassword<Login>
                                fieldName="password"
                                label="Password"
                            />

                            {/* Error Message */}
                            {loginMutation.isError && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center">
                                        <i className="pi pi-exclamation-triangle text-red-500 mr-2"></i>
                                        <span className="text-red-700 text-sm font-medium">
                                            Credenziali non valide o errore del
                                            server
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={!isValid || loginMutation.isLoading}
                                loading={loginMutation.isLoading}
                                className="w-full !bg-primary-600 !border-primary-600 hover:!bg-primary-700 py-3 font-semibold text-lg shadow-md transition-all duration-200"
                                size="large"
                            >
                                {loginMutation.isLoading ? (
                                    <span className="ml-4">
                                        Accesso in corso...
                                    </span>
                                ) : (
                                    <span className="flex gap-2 items-center justify-center">
                                        Accedi
                                        <FontAwesomeIcon
                                            icon={faRightToBracket}
                                            fixedWidth
                                        />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </FormProvider>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-surface-200 text-center">
                        <p className="text-xs text-surface-500">
                            &copy; {new Date().getFullYear()} Hermadata. All
                            rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginForm
