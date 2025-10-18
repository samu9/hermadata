import {
    faRightToBracket,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { FormProvider, useForm } from "react-hook-form"
import { useMutation } from "react-query"
import { Login, loginSchema } from "../../models/user.schema"
import { SubTitle } from "../typography"
import ControlledInputText from "../forms/ControlledInputText"
import ControlledInputPassword from "../forms/ControlledInputPassword"
import { useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

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
        <form onSubmit={handleSubmit(onSubmit)} className="w-[480px]">
            <SubTitle>Login</SubTitle>
            <FormProvider {...form}>
                <div className="flex flex-col gap-2 items-start">
                    <ControlledInputText<Login>
                        fieldName="username"
                        label="Email"
                        className="w-full"
                    />

                    <ControlledInputPassword<Login>
                        fieldName="password"
                        label="Password"
                    />

                    {loginMutation.isError && (
                        <div className="text-red-500 text-sm">
                            Credenziali non valide o errore del server
                        </div>
                    )}

                    <Button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        disabled={!isValid || loginMutation.isLoading}
                        loading={loginMutation.isLoading}
                    >
                        <FontAwesomeIcon
                            icon={faRightToBracket}
                            fixedWidth
                            className="pr-2"
                        />{" "}
                        Entra
                    </Button>
                </div>
            </FormProvider>
        </form>
    )
}

export default LoginForm
