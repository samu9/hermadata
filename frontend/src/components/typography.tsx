import { classNames } from "primereact/utils"

type Props = {
    children: React.ReactNode
    className?: string
}

export const PageTitle = (props: Props) => (
    <h1
        className={classNames(
            "text-3xl font-bold text-surface-900 tracking-tight mb-4",
            props.className
        )}
    >
        {props.children}
    </h1>
)

export const SubTitle = (props: Props) => (
    <h3
        className={classNames(
            "text-xl font-semibold text-surface-600 mb-2",
            props.className
        )}
    >
        {props.children}
    </h3>
)

export const SectionTitle = (props: Props) => (
    <h4
        className={classNames(
            "text-lg font-semibold text-surface-800 mb-3",
            props.className
        )}
    >
        {props.children}
    </h4>
)

export const InputLabel = (
    props: Props & { htmlFor?: string; disabled?: boolean }
) => (
    <label
        htmlFor={props.htmlFor}
        className={classNames(
            "block text-sm font-medium mb-1",
            {
                "text-surface-700": !props.disabled,
                "text-surface-400": props.disabled,
            },
            props.className
        )}
    >
        {props.children}
    </label>
)
