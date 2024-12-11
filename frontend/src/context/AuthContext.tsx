import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@services/api';

interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, company: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      console.log('Initializing auth...'); // Debug log
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log('Token found, fetching user data...'); // Debug log
          await fetchUserData();
        } catch (error) {
          console.error('Error initializing auth:', error);
          logout();
        }
      } else {
        console.log('No token found'); // Debug log
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data...'); // Debug log
      const response = await api.get('/auth/me');
      console.log('User data received:', response.data); // Debug log
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login...'); // Debug log
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      console.log('Login successful, user:', user); // Debug log
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, company: string) => {
    try {
      console.log('Attempting registration...'); // Debug log
      const response = await api.post('/auth/register', { name, email, password, company });
      const { token, user } = response.data;
      console.log('Registration successful, user:', user); // Debug log
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('Logging out...'); // Debug log
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  console.log('AuthContext value:', value); // Debug log

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

export default AuthContext;
