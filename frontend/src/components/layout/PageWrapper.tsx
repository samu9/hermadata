type Props = {
    children: React.ReactNode
}

const PageWrapper = (props: Props) => {
    return <div className="p-4">{props.children}</div>
}

export default PageWrapper
