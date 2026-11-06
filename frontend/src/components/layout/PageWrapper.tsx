type Props = {
    children: React.ReactNode
}

const PageWrapper = (props: Props) => {
    return (
        <div className="flex flex-col min-h-full bg-surface-50">
            {/* Extra bottom padding on mobile so floating action buttons don't cover content */}
            <div className="flex-1 p-6 md:p-8 pb-24 md:pb-8 w-full">
                {props.children}
            </div>
        </div>
    )
}

export default PageWrapper
