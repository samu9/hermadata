const ApiEndpoints = {
    race: {
        getAll: "/race",
        getByCode: (code: string) => `/race/${code}`,
        create: "/race",
    },
    animal: {
        getByCode: (code: string) => `/animal/${code}`,
        create: "/animal",
    },
    util: {
        getProvince: "/util/province",
        getComuni: "/util/comuni",
    },
}
export default ApiEndpoints
