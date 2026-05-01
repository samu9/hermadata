import { Button } from "primereact/button"
import { useRef, useState } from "react"
import { useQueryClient } from "react-query"
import { apiService } from "../../main"
import { toastService } from "../../services/toast"

type Props = {
    animalId: number
    onComplete?: () => void
}

const AnimalImageUploadForm = ({ animalId, onComplete }: Props) => {
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)

    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0]
        if (!file) return
        setLoading(true)
        try {
            const image = await apiService.uploadAnimalImage(animalId, file)
            await apiService.setProfileImage(animalId, image.id)
            queryClient.invalidateQueries(["animal", String(animalId)])
            queryClient.invalidateQueries(["animal-images", animalId])
            toastService.showSuccess("Immagine aggiornata")
            onComplete?.()
        } catch {
            toastService.showError("Upload dell'immagine fallito")
        } finally {
            setLoading(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    return (
        <div className="flex flex-col items-center gap-4 py-2">
            <p className="text-surface-600 text-sm text-center">
                Carica una nuova immagine. Verrà impostata automaticamente come
                foto profilo.
            </p>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
            <Button
                className="w-full justify-center"
                loading={loading}
                onClick={() => fileInputRef.current?.click()}
            >
                Seleziona immagine
            </Button>
        </div>
    )
}

export default AnimalImageUploadForm
