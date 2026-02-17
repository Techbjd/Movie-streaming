import axios from "axios"



const apiURL = import.meta.env.VITE_API
console.log(apiURL)

const api = axios.create({
  baseURL: apiURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  },


})
export default api
