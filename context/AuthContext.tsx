import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LoginCredentials, RegisterCredentials, ApiResponse } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (credentials: RegisterCredentials) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8200';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));

  const isAuthenticated = !!token;

  const login = async (credentials: LoginCredentials) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/app/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data: ApiResponse<{ token: { access_token: string; token_type: string } }> = await response.json();

    if (!response.ok || data.code !== 0) {
      const errorMessage = data.message || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
    
    const authToken = data.data?.token?.access_token;

    if (!authToken) {
      throw new Error('Login successful, but no authentication token was provided in the response.');
    }

    localStorage.setItem('authToken', authToken);
    setToken(authToken);
  };
  
  const register = async (credentials: RegisterCredentials) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/app/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: credentials.name,
        email: credentials.email,
        password: credentials.password,
      }),
    });
  
    const data: ApiResponse = await response.json();

    if (!response.ok || data.code !== 0) {
      const errorMessage = data.message || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};