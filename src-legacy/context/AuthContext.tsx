'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  usn: string;
  role: string;
  semester: string;
  department: string;
  avatar: string;
  isLoggedIn: boolean;
}

const DEFAULT_USER: UserProfile = {
  name: 'Nilotpal Deb',
  email: 'nilotpal@jainuniversity.ac.in',
  usn: '23BCSE1042',
  role: 'Student',
  semester: '3rd Sem',
  department: 'Faculty of Engineering & Technology (FET)',
  avatar: 'ND',
  isLoggedIn: true,
};

interface AuthContextType {
  user: UserProfile;
  login: (credentials?: Partial<UserProfile>) => void;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('jainspace_auth');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        setUser(DEFAULT_USER);
      }
    }
  }, []);

  const login = (credentials?: Partial<UserProfile>) => {
    const updated: UserProfile = {
      ...DEFAULT_USER,
      ...credentials,
      isLoggedIn: true,
    };
    setUser(updated);
    localStorage.setItem('jainspace_auth', JSON.stringify(updated));
  };

  const logout = () => {
    const loggedOut: UserProfile = {
      ...DEFAULT_USER,
      isLoggedIn: false,
    };
    setUser(loggedOut);
    localStorage.setItem('jainspace_auth', JSON.stringify(loggedOut));
  };

  const updateUser = (data: Partial<UserProfile>) => {
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('jainspace_auth', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
