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
        addEntry: (id: string) => `/animal/${id}/entry`,
        completeEntry: (id: string) => `/animal/${id}/entry/complete`,
        getEntries: (id: string) => `/animal/${id}/entries`,
        updateEntry: (animalId: string, entryId: number) =>
            `/animal/${animalId}/entries/${entryId}`,
        documents: (id: number) => `/animal/${id}/document`,
        newDocument: (id: number) => `/animal/${id}/document`,
        exit: (id: number) => `/animal/${id}/exit`,
        daysReport: `/animal/days/report`,
        entriesReport: `/animal/entries/report`,
        exitsReport: `/animal/exits/report`,
    },
    adopter: {
        create: "/adopter",
        get: "/adopter",
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
        activities: "/user/activities",
        roles: "/user/roles",
    },
    util: {
        getProvince: "/util/province",
        getComuni: "/util/comuni",
        getEntryTypes: "/util/entry-types",
        getExitTypes: "/util/exit-types",
        getAnimalSizes: "/util/animal-size",
        getAnimalFurTypes: "/util/animal-fur",
        furColor: "/util/fur-color",
    },
    vet: {
        create: "/vet",
        search: "/vet/search",
    },
}
export default ApiEndpoints
