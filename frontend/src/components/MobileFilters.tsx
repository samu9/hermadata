import { ReactNode, useId, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faChevronDown,
    faChevronUp,
    faFilter,
} from "@fortawesome/free-solid-svg-icons"
import { classNames } from "primereact/utils"
import { useIsMobile } from "../hooks/useMediaQuery"

type Props = {
    /** Filters that differ from their defaults, shown as a badge. */
    activeCount?: number
    /** Classes for the block holding the filters once opened (mobile). */
    className?: string
    children: ReactNode
}

/**
 * Filter controls that collapse behind a "Filtri" button on small screens.
 *
 * On desktop the children are rendered as they are, with no wrapper, so the
 * surrounding layout is untouched. Below the `lg` breakpoint a toggle button
 * is rendered instead and the children appear, wrapped in a block styled by
 * `className`, once it is opened.
 */
const MobileFilters = ({ activeCount = 0, className, children }: Props) => {
    const isMobile = useIsMobile()
    const [open, setOpen] = useState(false)
    const panelId = useId()

    if (!isMobile) return <>{children}</>

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls={panelId}
                className={classNames(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                    open || activeCount > 0
                        ? "bg-primary-50 border-primary-200 text-primary-700"
                        : "bg-white border-surface-300 text-surface-700",
                )}
            >
                <FontAwesomeIcon icon={faFilter} />
                Filtri
                {activeCount > 0 && (
                    <span
                        className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-primary-600 text-white text-xs leading-5 text-center"
                        aria-label={`${activeCount} filtri attivi`}
                    >
                        {activeCount}
                    </span>
                )}
                <FontAwesomeIcon
                    icon={open ? faChevronUp : faChevronDown}
                    className="text-xs"
                />
            </button>
            {open && (
                <div id={panelId} className={className}>
                    {children}
                </div>
            )}
        </>
    )
}

export default MobileFilters
