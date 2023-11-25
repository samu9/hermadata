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
        className="text-[1.2rem] font-bold"
        // style={{ color: "var(--primary-color)" }}
    >
        {props.children}
    </h3>
)
export const InputLabel = (props: Props & { htmlFor?: string }) => (
    <label htmlFor={props.htmlFor} className="text-xs text-gray-500">
        {props.children}
    </label>
)
