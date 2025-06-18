// client/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

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

  // New function to update user state from other parts of the app
  const updateUser = (updatedFields) => {
    setUser(prevUser => {
      const newUser = { ...prevUser, ...updatedFields };
      
      // Also update the token in localStorage to reflect the change on next reload
      const token = localStorage.getItem('token');
      if (token) {
        // We can't change the existing token, but for a better user experience on refresh,
        // it's best to re-fetch user data or get a new token. For now, this state update is enough for a live session.
        // A more robust solution might involve a new JWT from the server on theme change.
      }
      
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;