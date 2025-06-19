// src/services/api.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend URL
});

// Interceptor to ADD the token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


// Interceptor to HANDLE 401 errors on responses
axiosInstance.interceptors.response.use(
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
            window.location.href = '/login';
        }

        // For all other errors, just reject the promise to let the component handle it
        return Promise.reject(error);
    }
);

const api = {
    ...axiosInstance, // Keep original axios methods
    getMessagesPaginated: (channelId, page = 1) => axiosInstance.get(`/chat/messages/${channelId}?page=${page}`),
    updateUserProfile: (data) => axiosInstance.put('/users/profile', data),
    updateUserPassword: (data) => axiosInstance.put('/users/password', data),
    updateUserTheme: (data) => axiosInstance.put('/users/theme', data),
};


export default api;