import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // or a loading spinner
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default ProtectedRoute; 