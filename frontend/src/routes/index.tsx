import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import {
  Dashboard,
  PersonaList,
  PersonaCreate,
  PersonaEdit,
  TestList,
  TestCreate,
  TestEdit,
  TestDetail,
  Login,
  Register
} from '../config/lazyRoutes';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  );
};

export const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
      />
      
      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="personas">
          <Route index element={<PersonaList />} />
          <Route path="new" element={<PersonaCreate />} />
          <Route path=":id/edit" element={<PersonaEdit />} />
        </Route>
        <Route path="tests">
          <Route index element={<TestList />} />
          <Route path="new" element={<TestCreate />} />
          <Route path=":id" element={<TestDetail />} />
          <Route path=":id/edit" element={<TestEdit />} />
        </Route>
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
