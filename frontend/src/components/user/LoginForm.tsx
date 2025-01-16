import {
    faArrowTurnDown,
    faDownload,
    faRightToBracket,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { FormProvider, useForm } from "react-hook-form"
import { useMutation } from "react-query"
import { Login, loginSchema } from "../../models/user.schema"
import { apiService } from "../../main"
import { SubTitle } from "../typography"
import ControlledInputText from "../forms/ControlledInputText"
import ControlledInputPassword from "../forms/ControlledInputPassword"
import { useEffect } from "react"

const LoginForm = () => {
    const form = useForm<Login>({
        resolver: zodResolver(loginSchema),
    })

    const {
        handleSubmit,
        formState: { isValid, errors },
        watch,
        getValues,
    } = form
    useEffect(() => {
        console.log(errors, isValid)
    }, [watch()])

    // React Query Mutation for API call
    const login = useMutation({
        mutationFn: (request: Login) => apiService.login(request),
        onSuccess: (result: boolean, variables: Login, context) => {
            console.log("logged")
        },
        mutationKey: "login",
    })

    // Handle form submission
    const onSubmit = async (data: Login) => {
        const validated = loginSchema.parse(data)
        login.mutateAsync(validated)
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

                    <Button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        disabled={!isValid}
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
