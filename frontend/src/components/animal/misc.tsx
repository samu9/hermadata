import { faMicrochip } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { classNames } from "primereact/utils"

export const ChipCodeBadge = ({ code }: { code?: string }) => (
    <div
        className={classNames(
            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border",
            {
                "bg-gray-50 border-gray-200 text-gray-500": !code,
                "bg-blue-50 border-blue-200 text-blue-700 font-mono": code,
            }
        )}
    >
        <FontAwesomeIcon
            icon={faMicrochip}
            className={classNames("w-3 h-3", {
                "text-gray-400": !code,
                "text-blue-600": code,
            })}
        />
        <span>{code || "Chip non assegnato"}</span>
    </div>
)
