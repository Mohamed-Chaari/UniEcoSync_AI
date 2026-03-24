import React, { createContext, useContext, useState } from 'react';
import { auth } from '@/services/firebase';
import { router } from 'expo-router';

type Role = "student" | "professor" | "maintenance" | "admin" | null;

interface AuthContextType {
  user: any | null; // using any for mock User
  role: Role;
  loading: boolean;
  login: (role: Role) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: false,
  login: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(false); // No longer loading initially in mock system

  const login = (selectedRole: Role) => {
    setUser(auth.currentUser);
    setRole(selectedRole);
    router.replace('/(tabs)');
  };

  const signOut = async () => {
    setUser(null);
    setRole(null);
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
