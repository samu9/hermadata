import axios, { AxiosInstance } from "axios"

class ApiService {
    inst: AxiosInstance

    constructor(baseURL: string) {
        this.inst = axios.create({
            baseURL,
            headers: {
                "Content-Type": "application/json",
            },
        })
    }

    private async get(endpoint: string) {}

    private async post<T>(endpoint: string, data: object): Promise<T> {
        const res = await this.inst.post<T>(endpoint, data)
        return res.data
    }

    createAnimal(data: { name: string }) {
        return this.post(ApiEndpoints.animal.create, data)
    }
}

export default ApiService
