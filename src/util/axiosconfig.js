import axios from "axios";

// Axios Instance
const axiosInstance = axios.create({
    baseURL: "http://localhost:8080"
});

// Request Interceptor
axiosInstance.interceptors.request.use(

    (config) => {

        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }

);

export default axiosInstance;