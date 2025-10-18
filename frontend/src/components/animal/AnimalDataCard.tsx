import React from "react"
import { Card } from "primereact/card"
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
        <Card
            className={classNames("h-fit", className)}
            title={
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-lg font-semibold text-gray-800">
                        {title}
                    </span>
                </div>
            }
        >
            <div className="space-y-3">
                {items.map((item, index) => (
                    <DataRow
                        key={index}
                        label={item.label}
                        value={item.value}
                        icon={item.icon}
                    />
                ))}
            </div>
        </Card>
    )
}

interface DataRowProps {
    label: string
    value: string | React.ReactNode
    icon?: React.ReactNode
}

const DataRow: React.FC<DataRowProps> = ({ label, value, icon }) => {
    return (
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-sm font-medium text-gray-600">
                    {label}:
                </span>
            </div>
            <div className="text-sm text-gray-900 font-semibold text-right flex-1 ml-4">
                {value}
            </div>
        </div>
    )
}

export { AnimalDataCard, DataRow }
export type { DataItem, AnimalDataCardProps }
