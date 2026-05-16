const ApiEndpoints = {
    doc: {
        open: (id: number) => `/document/${id}`,
        getAllKinds: "/document/kind",
        createKind: "/document/kind",
        upload: "/document",
    },
    race: {
        getAll: "/race",
        getByCode: (code: string) => `/race/${code}`,
        create: "/race",
    },
    breed: {
        create: "/breed",
        getAll: "/breed",
    },
    animal: {
        getById: (code: string) => `/animal/${code}`,
        create: "/animal",
        search: "/animal/search",
        update: (id: string) => `/animal/${id}`,
        delete: (id: number) => `/animal/${id}`,
        addEntry: (id: string) => `/animal/${id}/entry`,
        completeEntry: (id: string) => `/animal/${id}/entry/complete`,
        getEntries: (id: string) => `/animal/${id}/entries`,
        updateEntry: (animalId: string, entryId: number) =>
            `/animal/${animalId}/entries/${entryId}`,
        documents: (id: number) => `/animal/${id}/document`,
        newDocument: (id: number) => `/animal/${id}/document`,
        uploadImage: (id: number) => `/animal/${id}/image`,
        listImages: (id: number) => `/animal/${id}/images`,
        serveImage: (animalId: number, imageId: number) =>
            `/animal/${animalId}/image/${imageId}`,
        setProfileImage: (animalId: number, imageId: number) =>
            `/animal/${animalId}/image/${imageId}/profile`,
        deleteImage: (animalId: number, imageId: number) =>
            `/animal/${animalId}/image/${imageId}`,
        exit: (id: number) => `/animal/${id}/exit`,
        checkExit: (id: number) => `/animal/${id}/exit-check`,
        moveToShelter: (id: string) => `/animal/${id}/move_to_shelter`,
        confirmTemporaryAdoption: (id: number) =>
            `/animal/${id}/confirm-temporary-adoption`,
        undoTemporaryAdoption: (id: number) =>
            `/animal/${id}/undo-temporary-adoption`,
        getLogs: (id: string | number) => `/animal/${id}/logs`,
        daysReport: `/animal/days/report`,
        entriesReport: `/animal/entries/report`,
        exitsReport: `/animal/exits/report`,
        searchReport: `/animal/search/report`,
    },
    adopter: {
        create: "/adopter",
        get: "/adopter",
        getById: (id: number) => `/adopter/${id}`,
        search: "/adopter/search",
    },
    adoption: {
        create: "/adoption",
    },
    user: {
        login: "/user/login",
        register: "/user/register",
        getAll: "/user/",
        create: "/user/",
        update: (id: number) => `/user/${id}`,
        delete: (id: number) => `/user/${id}`,
        changePassword: (id: number) => `/user/${id}/password`,
        getCurrentUser: "/user/me",
        activity: "/user/activity",
        roles: "/user/roles",
        permissions: "/user/permissions",
    },
    util: {
        getProvince: "/util/province",
        getComuni: "/util/comuni",
        getComune: (code: string) => `/util/comune/${code}`,
        getEntryTypes: "/util/entry-types",
        getExitTypes: "/util/exit-types",
        getAnimalSizes: "/util/animal-size",
        getAnimalFurTypes: "/util/animal-fur",
        furColor: "/util/fur-color",
        events: "/util/events",
    },
    therapy: {
        list: (animalId: number) => `/animal/${animalId}/therapies`,
        create: (animalId: number) => `/animal/${animalId}/therapies`,
        delete: (animalId: number, therapyId: number) =>
            `/animal/${animalId}/therapies/${therapyId}`,
        end: (animalId: number, therapyId: number) =>
            `/animal/${animalId}/therapies/${therapyId}/end`,
        attachDocument: (animalId: number, therapyId: number, docType: string) =>
            `/animal/${animalId}/therapies/${therapyId}/document/${docType}`,
        reminders: "/therapies/reminders",
    },
    vet: {
        create: "/vet",
        search: "/vet/search",
    },
    structure: {
        getAll: "/structure",
        moveAnimal: (animalId: number) =>
            `/animal/${animalId}/move-structure`,
    },
}
export default ApiEndpoints
