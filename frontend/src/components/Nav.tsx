import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars } from "@fortawesome/free-solid-svg-icons"
import logo from "../assets/hermadata.svg"

type Props = {
    onMenuClick: () => void
}

/**
 * Mobile top bar. Only shown below the `lg` breakpoint; on desktop the sidebar
 * is always visible and this is hidden.
 */
const Nav = ({ onMenuClick }: Props) => {
    return (
        <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 h-14 px-4 bg-surface-900 border-b border-surface-800 shadow-sm">
            <button
                onClick={onMenuClick}
                aria-label="Apri menu"
                className="-ml-2 p-2 rounded-lg text-surface-200 hover:text-white hover:bg-surface-800 transition-colors"
            >
                <FontAwesomeIcon icon={faBars} className="text-lg" />
            </button>
            <img src={logo} className="w-7 h-7" alt="Logo" />
            <span className="font-bold text-lg text-white tracking-tight">
                Hermadata
            </span>
        </div>
    )
}

export default Nav
