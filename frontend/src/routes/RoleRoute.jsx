import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ allowed = [] }) {
  const { role } = useAuth();
  if (!allowed.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
