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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
            <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
                <div className="flex items-center gap-2 px-8">
                    <img src={logo} alt="HermaData Logo" className="w-24" />
                    {/* <HermaDataLogo size={100} color="#6366f1" /> */}
                    <div>
                        <span className="text-3xl text-primary font-bold">
                            HERMADATA
                        </span>
                        <p className="text-xs text-gray-500">
                            Animal Shelter Management System
                        </p>
                    </div>
                </div>
                {/* Form Section */}
                <div className="p-8">
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
                                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
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
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                    <div className="mt-8 pt-6 border-t border-gray-200 text-center"></div>
                </div>
            </Card>
        </div>
    )
}

export default LoginForm
