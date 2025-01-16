import React from "react"
import { useLoader } from "../contexts/Loader"
import { ProgressSpinner } from "primereact/progressspinner"

const Loader: React.FC = () => {
    const { loading } = useLoader()

    return loading ? (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
            }}
        >
            <ProgressSpinner />
        </div>
    ) : null
}

export default Loader
