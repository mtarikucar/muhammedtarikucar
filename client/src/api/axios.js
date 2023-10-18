import axios from 'axios';
const BASE_URL = 'http://localhost:3000/api';
//const BASE_URL = 'https://orca-app-5lor4.ondigitalocean.app/api';

export default axios.create({
    baseURL: BASE_URL
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/xml' },
    withCredentials: true
});