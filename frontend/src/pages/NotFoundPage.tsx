import { Link } from "react-router-dom"

const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 h-full">
            <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-12 text-center max-w-lg w-full">
                <h1 className="text-8xl font-bold text-primary-600 mb-4">
                    404
                </h1>
                <h2 className="text-3xl font-semibold text-surface-900 mb-4">
                    Pagina Non Trovata
                </h2>
                <p className="text-xl text-surface-600 mb-8">
                    🚧 In Costruzione 🚧
                </p>
                <p className="text-surface-500 mb-8">
                    La pagina che stai cercando non esiste o è ancora in fase di
                    sviluppo.
                </p>
                <Link
                    to="/"
                    className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold shadow-sm"
                >
                    Torna alla Home
                </Link>
            </div>
        </div>
    )
}

export default NotFoundPage
