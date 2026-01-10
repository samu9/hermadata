import React from "react"
import { useLoader } from "../contexts/Loader"
import { ProgressSpinner } from "primereact/progressspinner"

const Loader: React.FC = () => {
    const { loading } = useLoader()

    if (!loading) return null

    return (
        <div className="fixed inset-0 w-full h-full bg-surface-900/50 backdrop-blur-sm flex justify-center items-center z-[1000]">
            <ProgressSpinner strokeWidth="4" className="w-16 h-16" />
        </div>
    )
}

export default Loader
