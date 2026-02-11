import axios from 'axios';

// Dynamically determine the base URL
// If running on localhost, it will be http://localhost:5000/api
// If running on 192.168.1.5, it will be http://192.168.1.5:5000/api
const getBaseUrl = () => {
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
