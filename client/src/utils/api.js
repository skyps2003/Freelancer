import axios from 'axios';

// Dynamically determine the base URL
// - If VITE_API_URL is set (e.g., in .env), use it.
// - Otherwise, fallback to the current hostname detection or localhost default.
const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return `${import.meta.env.VITE_API_URL}/api`;
    }
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:5000/api`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;
