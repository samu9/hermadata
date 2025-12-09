import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Adopter } from "../../models/adopter.schema"
import { faPhone, faUser, faIdCard } from "@fortawesome/free-solid-svg-icons"

interface AdopterCardProps {
    data: Adopter
    variant?: "default" | "compact" | "selected"
    interactive?: boolean
    onClick?: () => void
}

const AdopterCard = ({
    data,
    variant = "default",
    interactive = false,
    onClick,
}: AdopterCardProps) => {
    const baseClasses = "border rounded-lg transition-all duration-200"

    const variantClasses = {
        default: "p-4 shadow-sm bg-white border border-surface-200",
        compact: "p-3 shadow-sm bg-white border border-surface-200",
        selected: "p-4 shadow-md bg-primary-50 border-primary-200",
    }

    const interactiveClasses = interactive
        ? "hover:shadow-md hover:border-primary-300 cursor-pointer hover:bg-primary-50"
        : ""

    const cardClasses = `${baseClasses} ${variantClasses[variant]} ${interactiveClasses}`

    const isCompact = variant === "compact"

    return (
        <div className={cardClasses} onClick={onClick}>
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                    className={`flex-shrink-0 flex items-center justify-center rounded-full bg-primary-100 text-primary-600 ${
                        isCompact ? "w-10 h-10" : "w-12 h-12"
                    }`}
                >
                    <FontAwesomeIcon
                        icon={faUser}
                        className={isCompact ? "text-lg" : "text-xl"}
                    />
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        {/* Name */}
                        <div>
                            <h3
                                className={`font-semibold text-surface-900 truncate ${
                                    isCompact ? "text-base" : "text-lg"
                                }`}
                            >
                                {data.name} {data.surname}
                            </h3>
                        </div>

                        {/* Phone - Right aligned on desktop, below name on mobile */}
                        <div className="flex items-center gap-1 text-surface-600">
                            <FontAwesomeIcon
                                icon={faPhone}
                                className={`text-surface-400 ${
                                    isCompact ? "text-xs" : "text-sm"
                                }`}
                            />
                            <span
                                className={`${
                                    isCompact ? "text-sm" : "text-base"
                                } font-medium`}
                            >
                                {data.phone}
                            </span>
                        </div>
                    </div>

                    {/* Fiscal Code */}
                    <div className="flex items-center gap-1 mt-1">
                        <FontAwesomeIcon
                            icon={faIdCard}
                            className={`text-surface-400 ${
                                isCompact ? "text-xs" : "text-sm"
                            }`}
                        />
                        <span
                            className={`text-surface-600 font-mono ${
                                isCompact ? "text-sm" : "text-base"
                            }`}
                        >
                            {data.fiscal_code}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdopterCard
