import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL + '/api',
    withCredentials: true, // This is mandatory for sending/receiving HTTPOnly cookies
});