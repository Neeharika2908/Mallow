
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, UserProfile, Reminder } from '../types';

interface AuthContextType {
  user: User | null;
  authState: AuthState;
  login: (email: string) => void;
  signup: (email: string, profile: UserProfile) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  setAuthState: (state: AuthState) => void;
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  removeReminder: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>(AuthState.UNAUTHENTICATED);

  // Load user from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mallow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setAuthState(AuthState.AUTHENTICATED);
    }
  }, []);

  const login = (email: string) => {
    // Mock login - in a real app, this would hit a backend
    // Check if we have a stored profile for this email mock
    const storedDB = localStorage.getItem(`mallow_db_${email}`);
    if (storedDB) {
      const userData = JSON.parse(storedDB);
      setUser(userData);
      localStorage.setItem('mallow_user', JSON.stringify(userData));
      setAuthState(AuthState.AUTHENTICATED);
    } else {
      alert("User not found. Please sign up.");
    }
  };

  const signup = (email: string, profile: UserProfile) => {
    const newUser: User = { email, ...profile };
    localStorage.setItem(`mallow_db_${email}`, JSON.stringify(newUser));
    localStorage.setItem('mallow_user', JSON.stringify(newUser));
    setUser(newUser);
    setAuthState(AuthState.AUTHENTICATED);
  };

  const logout = () => {
    localStorage.removeItem('mallow_user');
    setUser(null);
    setAuthState(AuthState.UNAUTHENTICATED);
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...profile };
    setUser(updatedUser);
    localStorage.setItem('mallow_user', JSON.stringify(updatedUser));
    localStorage.setItem(`mallow_db_${user.email}`, JSON.stringify(updatedUser));
  };

  const addReminder = (reminderData: Omit<Reminder, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newReminder: Reminder = {
      ...reminderData,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    
    const updatedReminders = [...(user.reminders || []), newReminder];
    updateProfile({ reminders: updatedReminders });
  };

  const removeReminder = (id: string) => {
    if (!user || !user.reminders) return;
    const updatedReminders = user.reminders.filter(r => r.id !== id);
    updateProfile({ reminders: updatedReminders });
  };

  return (
    <AuthContext.Provider value={{ user, authState, login, signup, logout, updateProfile, setAuthState, addReminder, removeReminder }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
