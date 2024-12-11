import React, { lazy } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';

// Lazy load components with loading fallback
export const lazyImport = (factory: () => Promise<any>) => {
  return lazy(factory);
};

// Route components
export const Dashboard = lazyImport(() => import('../pages/Dashboard'));
export const PersonaList = lazyImport(() => import('../pages/PersonaList'));
export const PersonaCreate = lazyImport(() => import('../pages/PersonaCreate'));
export const PersonaEdit = lazyImport(() => import('../pages/PersonaEdit'));
export const TestList = lazyImport(() => import('../pages/TestList'));
export const TestCreate = lazyImport(() => import('../pages/TestCreate'));
export const TestEdit = lazyImport(() => import('../pages/TestEdit'));
export const TestDetail = lazyImport(() => import('../pages/TestDetail'));
export const Login = lazyImport(() => import('../pages/Login'));
export const Register = lazyImport(() => import('../pages/Register'));
export const Costs = lazyImport(() => import('../pages/Costs'));

// Shared components that might be heavy
export const PersonaForm = lazyImport(() => import('../components/PersonaForm'));
export const TestForm = lazyImport(() => import('../components/TestForm'));

// Loading component for Suspense fallback
export const SuspenseLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <React.Suspense fallback={<LoadingScreen />}>
      {children}
    </React.Suspense>
  );
};
