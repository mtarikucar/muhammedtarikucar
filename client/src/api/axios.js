import axios from 'axios';

// Determine base URL based on environment
const getBaseURL = () => {
  // Check if running in development
  if (import.meta.env.DEV) {
    // In development, use the proxy setup
    return '/api';
  }
  
  // Production URLs
  const prodDomains = ['muhammedtarikucar.com', 'www.muhammedtarikucar.com'];
  
  if (prodDomains.includes(window.location.hostname)) {
    return `${window.location.protocol}//${window.location.host}/api`;
  }
  
  // Default fallback for unknown environments
  return '/api';
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