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
        documents: (id: number) => `/animal/${id}/document`,
        newDocument: (id: number) => `/animal/${id}/document`,
    },
    adopter: {
        create: "/adopter",
    },
    util: {
        getProvince: "/util/province",
        getComuni: "/util/comuni",
        getEntryTypes: "/util/entry-types",
        getAnimalSizes: "/util/animal-size",
        getAnimalFurTypes: "/util/animal-fur",
    },
}
export default ApiEndpoints
