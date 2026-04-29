import React from "react"
import { classNames } from "primereact/utils"

interface DataItem {
    label: string
    value: string | React.ReactNode
    icon?: React.ReactNode
}

interface AnimalDataCardProps {
    title: string
    items: DataItem[]
    className?: string
    icon?: React.ReactNode
}

const AnimalDataCard: React.FC<AnimalDataCardProps> = ({
    title,
    items,
    className,
    icon,
}) => {
    return (
        <div
            className={classNames(
                "bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden h-fit",
                className,
            )}
        >
            <div className="px-5 py-3.5 border-b border-surface-100 flex items-center gap-2 bg-surface-50">
                {icon && (
                    <span className="text-surface-500">{icon}</span>
                )}
                <span className="text-xs font-semibold text-surface-600 uppercase tracking-wider">
                    {title}
                </span>
            </div>
            <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-5">
                {items.map((item, index) => (
                    <DataRow
                        key={index}
                        label={item.label}
                        value={item.value}
                        icon={item.icon}
                    />
                ))}
            </div>
        </div>
    )
}

interface DataRowProps {
    label: string
    value: string | React.ReactNode
    icon?: React.ReactNode
}

const DataRow: React.FC<DataRowProps> = ({ label, value, icon }) => {
    if (!label) {
        return (
            <div className="col-span-2 text-sm text-surface-700 leading-relaxed">
                {value}
            </div>
        )
    }

    return (
        <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5">
                {icon && <span className="flex-shrink-0">{icon}</span>}
                <span className="text-xs font-medium text-surface-500 uppercase tracking-wide truncate">
                    {label}
                </span>
            </div>
            <div className="text-sm font-semibold text-surface-800 break-words">
                {value ?? <span className="text-surface-300 font-normal">—</span>}
            </div>
        </div>
    )
}

export { AnimalDataCard, DataRow }
export type { DataItem, AnimalDataCardProps }
