import React, { createContext, useContext, useState, useEffect } from 'react';
import { login, register, getCurrentUser } from '@services/auth';
import type { User, LoginCredentials, RegisterData } from '@services/auth';

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        const userData = await getCurrentUser();
        console.log('Current user data:', userData);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error in initAuth:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      console.log('Attempting login...');
      const response = await login(credentials);
      console.log('Login response:', response);
      
      // Salvar o token no localStorage
      localStorage.setItem('token', response.token);
      
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      const { user: userData } = await register(data);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
