// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend URL
});

// Interceptor to ADD the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


// NEW: Interceptor to HANDLE 401 errors on responses
api.interceptors.response.use(
    (response) => {
        // If the request was successful, just return the response
        return response;
    },
    (error) => {
        // Check if the error is specifically a 401 Unauthorized error
        if (error.response && error.response.status === 401) {
            console.log("Session expired or token is invalid. Logging out.");
            
            // Remove the expired token from local storage
            localStorage.removeItem('token');

            // Redirect the user to the login page.
            // Using window.location.href is a simple way to force a full page reload 
            // and ensure all state is cleared.
            window.location.href = '/login';
        }

        // For all other errors, just reject the promise to let the component handle it
        return Promise.reject(error);
    }
);


export default api;