import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { Layout } from '@components/Layout';
import ErrorBoundary from '@components/ErrorBoundary';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { LanguageProvider } from '@contexts/LanguageContext';
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
  Costs
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
        <ErrorBoundary>
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
                isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
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
              <Route path="costs" element={<Costs />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </LanguageProvider>
    </ChakraProvider>
  );
};

export default App;
