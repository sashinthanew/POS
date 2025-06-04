'use client';

import type { UserRole } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('lankaPOSUserRole') as UserRole | null;
      if (storedRole) {
        setRoleState(storedRole);
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error);
      // Handle environments where localStorage is not available
    }
    setIsLoading(false);
  }, []);

  const setRole = (newRole: UserRole | null) => {
    setRoleState(newRole);
    if (newRole) {
      try {
        localStorage.setItem('lankaPOSUserRole', newRole);
      } catch (error) {
        console.error("Failed to access localStorage:", error);
      }
    } else {
      try {
        localStorage.removeItem('lankaPOSUserRole');
      } catch (error) {
        console.error("Failed to access localStorage:", error);
      }
    }
  };

  return (
    <UserContext.Provider value={{ role, setRole, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
