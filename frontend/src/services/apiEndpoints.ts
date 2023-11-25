const ApiEndpoints = {
    race: {
        getAll: "/race",
        getByCode: (code: string) => `/race/${code}`,
        create: "/race",
    },
    animal: {
        getByCode: (code: string) => `/animal/${code}`,
        create: "/animal",
        search: "/animal/search",
    },
    util: {
        getProvince: "/util/province",
        getComuni: "/util/comuni",
        getEntryTypes: "/util/entry-types",
    },
}
export default ApiEndpoints
