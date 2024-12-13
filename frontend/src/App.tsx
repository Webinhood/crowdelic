import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { Layout } from '@components/Layout';
import ErrorBoundary from '@components/ErrorBoundary';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { LanguageProvider } from '@contexts/LanguageContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { theme } from './theme/theme';
import Fonts from './theme/fonts';
import {
  Dashboard,
  Login,
  Register,
  PersonaList,
  PersonaCreate,
  PersonaEdit,
  TestList,
  TestCreate,
  TestEdit,
  TestDetail,
  Costs,
  Landing,
  UserManagement
} from './config/lazyRoutes';

const App = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Fonts />
      <LanguageProvider>
        <NavigationProvider>
          <ErrorBoundary>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />}
              />
              <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
              />
              <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
              />
              
              {/* Protected Routes */}
              <Route element={<Layout />}>
                <Route
                  path="/dashboard"
                  element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
                />
                {/* Personas Routes */}
                <Route
                  path="/personas/create"
                  element={isAuthenticated ? <PersonaCreate /> : <Navigate to="/login" replace />}
                />
                <Route
                  path="/personas/:id/edit"
                  element={isAuthenticated ? <PersonaEdit /> : <Navigate to="/login" replace />}
                />
                <Route
                  path="/personas"
                  element={isAuthenticated ? <PersonaList /> : <Navigate to="/login" replace />}
                />
                {/* Tests Routes */}
                <Route
                  path="/tests/create"
                  element={isAuthenticated ? <TestCreate /> : <Navigate to="/login" replace />}
                />
                <Route
                  path="/tests/:id/edit"
                  element={isAuthenticated ? <TestEdit /> : <Navigate to="/login" replace />}
                />
                <Route
                  path="/tests/:id"
                  element={isAuthenticated ? <TestDetail /> : <Navigate to="/login" replace />}
                />
                <Route
                  path="/tests"
                  element={isAuthenticated ? <TestList /> : <Navigate to="/login" replace />}
                />
                <Route
                  path="/costs"
                  element={isAuthenticated ? <Costs /> : <Navigate to="/login" replace />}
                />
                <Route
                  path="/users"
                  element={isAuthenticated ? <UserManagement /> : <Navigate to="/login" replace />}
                />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </NavigationProvider>
      </LanguageProvider>
    </ChakraProvider>
  );
};

export default App;
