import { useMatches, useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronRight, faHouse } from "@fortawesome/free-solid-svg-icons"

const AppBreadCrumbs = () => {
    const matches = useMatches()
    const navigate = useNavigate()
    const crumbs = matches
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((match) => Boolean((match.handle as any)?.crumb))
        .map((match) => ({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label: (match.handle as any).crumb(match) as string,
            path: match.pathname,
        }))

    return (
        <nav className="flex items-center gap-1.5 text-sm mb-4 text-surface-500">
            <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1.5 hover:text-surface-700 transition-colors"
            >
                <FontAwesomeIcon icon={faHouse} className="w-3 h-3" />
                <span>Bacheca</span>
            </button>
            {crumbs.map((crumb, i) => (
                <div key={i} className="flex items-center gap-1.5">
                    <FontAwesomeIcon
                        icon={faChevronRight}
                        className="w-2 h-2 text-surface-300"
                    />
                    {i < crumbs.length - 1 ? (
                        <button
                            onClick={() => navigate(crumb.path)}
                            className="hover:text-surface-700 transition-colors"
                        >
                            {crumb.label}
                        </button>
                    ) : (
                        <span className="text-surface-700 font-medium">
                            {crumb.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    )
}

export default AppBreadCrumbs
