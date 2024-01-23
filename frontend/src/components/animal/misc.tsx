import { faMicrochip } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { classNames } from "primereact/utils"

export const ChipCodeBadge = ({ code }: { code?: string }) => (
    <div
        className={classNames("text-sm flex gap-1 items-center", {
            "text-gray-300": !code,
            "font-mono mb-2": code,
        })}
    >
        <FontAwesomeIcon icon={faMicrochip} />
        <span>{code || "Chip non assegnato"}</span>
    </div>
)
