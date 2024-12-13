import { lazy } from 'react';

// Páginas públicas
export const Landing = lazy(() => 
  import('../pages/Landing')
    .then(module => {
      console.log('Landing module loaded:', module);
      return { default: module.Landing };
    })
    .catch(error => {
      console.error('Error loading Landing component:', error);
      throw error;
    })
);
export const Login = lazy(() => import('../pages/Login'));
export const Register = lazy(() => import('../pages/Register'));

// Páginas protegidas
export const Dashboard = lazy(() => import('../pages/Dashboard'));
export const PersonaList = lazy(() => import('../pages/PersonaList'));
export const PersonaCreate = lazy(() => import('../pages/PersonaCreate'));
export const PersonaEdit = lazy(() => import('../pages/PersonaEdit'));
export const TestList = lazy(() => import('../pages/TestList'));
export const TestCreate = lazy(() => import('../pages/TestCreate'));
export const TestEdit = lazy(() => import('../pages/TestEdit'));
export const TestDetail = lazy(() => import('../pages/TestDetail'));
export const Costs = lazy(() => import('../pages/Costs'));
export const UserManagement = lazy(() => import('../pages/UserManagement'));
