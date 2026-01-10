type Props = {
    children: React.ReactNode
}

const PageWrapper = (props: Props) => {
    return (
        <div className="flex flex-col min-h-full bg-surface-50">
            <div className="flex-1 p-6 md:p-8 w-full">{props.children}</div>
        </div>
    )
}

export default PageWrapper
