/**
 * Firebase Authentication Utilities
 * 
 * Centralized auth functions untuk reusability dan maintainability.
 * Semua error handling ada di sini, jadi components tinggal consume.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { UserRole, UserProfile } from '@/lib/types';

/**
 * Register user baru dengan role (customer/seller)
 * 
 * Flow:
 * 1. Create auth user di Firebase Auth
 * 2. Save additional data (role, name) di Firestore
 * 
 * @param email - User email
 * @param password - User password
 * @param role - User role (customer/seller)
 * @returns User credential
 */
export const registerUser = async (
  email: string,
  password: string,
  role: UserRole
): Promise<UserCredential> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Save user profile in Firestore
    const userProfile: UserProfile = {
      uid: userCredential.user.uid,
      email: email,
      role: role,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);

    return userCredential;
  } catch (error: unknown) {
    // Handle common Firebase Auth errors
    const firebaseError = error as { code?: string };
    switch (firebaseError.code) {
      case 'auth/email-already-in-use':
        throw new Error('Email sudah terdaftar');
      case 'auth/weak-password':
        throw new Error('Password minimal 6 karakter');
      case 'auth/invalid-email':
        throw new Error('Format email tidak valid');
      default:
        throw new Error('Registrasi gagal. Silakan coba lagi.');
    }
  }
};

/**
 * Login user
 * 
 * @param email - User email
 * @param password - User password
 * @returns User credential
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential;
  } catch (error: unknown) {
    // Handle common Firebase Auth errors
    const firebaseError = error as { code?: string };
    switch (firebaseError.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        throw new Error('Email atau password salah');
      case 'auth/invalid-email':
        throw new Error('Format email tidak valid');
      case 'auth/user-disabled':
        throw new Error('Akun telah dinonaktifkan');
      default:
        throw new Error('Login gagal. Silakan coba lagi.');
    }
  }
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch {
    throw new Error('Logout gagal. Silakan coba lagi.');
  }
};

/**
 * Get user profile dari Firestore
 * 
 * @param uid - User ID
 * @returns User profile atau null
 */
export const getUserProfile = async (
  uid: string
): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};
