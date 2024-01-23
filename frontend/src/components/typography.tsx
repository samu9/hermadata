import { classNames } from "primereact/utils"

type Props = {
    children: React.ReactNode
}
export const PageTitle = (props: Props) => (
    <h1
        className="text-[2rem] font-bold"
        style={{ color: "var(--primary-color)" }}
    >
        {props.children}
    </h1>
)

export const SubTitle = (props: Props) => (
    <h3
        className="text-[1.2rem] font-bold text-gray-500"
        // style={{ color: "var(--primary-color)" }}
    >
        {props.children}
    </h3>
)
export const InputLabel = (
    props: Props & { htmlFor?: string; disabled?: boolean }
) => (
    <label
        htmlFor={props.htmlFor}
        className={classNames("text-xs", {
            "text-gray-500": !props.disabled,
            "text-gray-400": props.disabled,
        })}
    >
        {props.children}
    </label>
)
