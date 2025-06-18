// client/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api'; // Import api to use the interceptor

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = jwtDecode(token).user;
        setUser(decodedUser);
      } catch (error) {
        // If token is invalid, remove it
        console.error("Invalid token found in storage.", error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    const decodedUser = jwtDecode(token).user;
    setUser(decodedUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Function to update user state from other parts of the app
  const updateUser = (updatedFields) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedFields };

      // To keep the JWT in sync with the user state after an update,
      // it's best practice to get a new token from the server.
      // For now, we update the state locally for immediate UI feedback.
      // A robust solution would involve an endpoint that returns a new token on profile update.
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode(token);
        const newPayload = { ...decodedToken, user: newUser };
        // This is a simplified example; re-signing a token should happen on the server.
        // The local user state update is sufficient for the current session.
      }
      
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;