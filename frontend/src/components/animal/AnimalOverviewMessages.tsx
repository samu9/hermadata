import { Messages, MessagesMessage } from "primereact/messages"
import { useAnimalQuery } from "../../queries"
import { useEffect, useRef } from "react"
import AnimalCompleteEntryForm from "./AnimalCompleteEntryForm"
import { Toast } from "primereact/toast"
import { classNames } from "primereact/utils"

type Props = {
    animal_id: string
}
type TemplateProps = {
    title: string
    content: React.ReactNode
    icon: string
}
const WarningTemplate = (props: TemplateProps) => (
    <div>
        <div className="flex gap-2 items-center mb-2">
            <i className={classNames("pi text-[1.5rem]", props.icon)}></i>
            <span className="p-message-summary">{props.title}</span>
        </div>
        {props.content}
    </div>
)
const AnimalOverviewMessages = (props: Props) => {
    const animalQuery = useAnimalQuery(props.animal_id)
    const msgs = useRef<Messages>(null)
    const toast = useRef<Toast>(null)

    const completeEntryMessage: MessagesMessage = {
        sticky: true,
        severity: "warn",
        closable: false,
        content: (
            <WarningTemplate
                icon="pi-exclamation-triangle"
                title="Completa l'ingresso"
                content={
                    <AnimalCompleteEntryForm
                        onComplete={() =>
                            toast.current?.show({
                                severity: "success",
                                summary: "Ingresso completato",
                            })
                        }
                        animal_id={props.animal_id}
                    />
                }
            />
        ),
    }

    const missingChipMessage: MessagesMessage = {
        sticky: true,
        severity: "warn",
        summary: "Chip mancante",
        // detail: "Completare l'ingresso",
        closable: false,
    }
    useEffect(() => {
        if (!msgs.current) return
        msgs.current.clear()

        !animalQuery.data?.entry_date &&
            msgs.current.show([completeEntryMessage])

        !animalQuery.data?.chip_code && msgs.current.show([missingChipMessage])
    }, [animalQuery.data])
    return (
        <div>
            <Messages ref={msgs} />
            <Toast ref={toast} position="bottom-right" />
        </div>
    )
}

export default AnimalOverviewMessages
