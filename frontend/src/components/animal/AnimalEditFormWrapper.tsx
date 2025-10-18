import { usePermissions } from "../../hooks/usePermissions"
import AnimalEditForm from "./AnimalEditForm"
import SuperUserAnimalEditForm from "./SuperUserAnimalEditForm"

/**
 * Wrapper component that renders the appropriate animal edit form based on user permissions
 */
const AnimalEditFormWrapper = () => {
    const { isSuperUser } = usePermissions()

    // Super users get access to the enhanced form with additional administrative fields
    if (isSuperUser) {
        return <SuperUserAnimalEditForm />
    }

    // Regular users get the standard form
    return <AnimalEditForm />
}

export default AnimalEditFormWrapper