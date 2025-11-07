import { Link } from "react-router-dom";

const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                <h2 className="text-3xl font-semibold text-gray-700 mb-4">
                    Pagina Non Trovata
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                    🚧 In Costruzione 🚧
                </p>
                <p className="text-gray-500 mb-8">
                    La pagina che stai cercando non esiste o è ancora in fase di sviluppo.
                </p>
                <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Torna alla Home
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
