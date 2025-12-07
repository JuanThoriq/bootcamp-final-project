/**
 * Authentication Context
 * 
 * Context API untuk manage authentication state di seluruh aplikasi.
 * 
 * Kenapa pakai Context API?
 * - Built-in React, no external library
 * - Global state management untuk auth
 * - Semua components bisa akses user info tanpa prop drilling
 * 
 * Pattern yang digunakan:
 * 1. Create Context
 * 2. Create Provider Component
 * 3. Create Custom Hook untuk consume context
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserProfile } from '@/lib/firebase/auth';
import { UserProfile } from '@/lib/types';

/**
 * Auth Context Type
 * Definisikan apa aja yang bisa diakses dari context
 */
interface AuthContextType {
  user: User | null; // Firebase Auth User
  userProfile: UserProfile | null; // Custom user profile dari Firestore
  loading: boolean; // Loading state saat check auth
}

/**
 * Create Context dengan default value null
 * Kita akan override value ini di Provider
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 * 
 * Component ini wrap seluruh app dan provide auth state.
 * Otomatis listen ke Firebase auth state changes.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * onAuthStateChanged adalah Firebase listener
     * Automatically triggered saat:
     * - User login
     * - User logout
     * - Page refresh (check if user still logged in)
     * 
     * Best Practice: Unsubscribe saat component unmount
     */
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // User logged in, fetch profile dari Firestore
        const profile = await getUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        // User logged out
        setUserProfile(null);
      }

      setLoading(false);
    });

    // Cleanup: Unsubscribe saat component unmount
    return () => unsubscribe();
  }, []);

  // Value yang akan di-share ke seluruh app
  const value = {
    user,
    userProfile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom Hook untuk consume Auth Context
 * 
 * Kenapa buat custom hook?
 * - Cleaner code: useAuth() instead of useContext(AuthContext)
 * - Error handling: Langsung error kalau dipake di luar Provider
 * - Type safety: TypeScript auto-complete
 * 
 * Usage di component:
 * const { user, userProfile, loading } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
