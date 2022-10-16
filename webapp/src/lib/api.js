import axios from 'axios'

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: false,
})

export const getGarageOverview = async () => {
    return instance.get("garage/overview").then(res => res.data)
}
