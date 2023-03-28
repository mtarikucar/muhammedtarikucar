import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

const authJson = localStorage.getItem('persist:root');
const auth = authJson ? JSON.parse(authJson) : {};
const token = auth?.currentUser?.token ?? '';

export const publicRequest = axios.create({
  baseURL: BASE_URL,
});

export const userRequest = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
