import React from 'react';
import { Navigate } from 'react-router-dom';

// This will check if the user is authenticated
const ProtectedRoute = ({ children }) => {
  const authToken = localStorage.getItem('authToken'); // or use sessionStorage
  
  if (!authToken) {
    // If not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the requested child component
  return children;
};

export default ProtectedRoute;
