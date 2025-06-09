import axios from 'axios';

// Determine base URL based on environment
const getBaseURL = () => {
  // If we're in production or the hostname is the domain
  if (import.meta.env.PROD || window.location.hostname === 'muhammedtarikucar.com' || window.location.hostname === 'www.muhammedtarikucar.com') {
    return `${window.location.protocol}//${window.location.host}/api`;
  }
  // Development fallback
  return 'http://localhost:5000/api';
};

const BASE_URL = getBaseURL();

export default axios.create({
    baseURL: BASE_URL
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});