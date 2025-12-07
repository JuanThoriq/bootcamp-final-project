/**
 * Protected Route Component for Seller Pages
 * 
 * Higher-Order Component yang protect routes berdasarkan user role.
 * Hanya seller yang bisa akses seller pages.
 * 
 * Pattern:
 * - Check authentication status
 * - Check user role
 * - Redirect if not authorized
 * - Show loading state while checking
 * 
 * Usage:
 * <ProtectedRoute allowedRole="seller">
 *   <YourSellerComponent />
 * </ProtectedRoute>
 */

'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { UserRole } from '@/lib/types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole: UserRole;
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Not logged in → redirect to login
      if (!user) {
        router.push('/login');
        return;
      }

      // Logged in but wrong role → redirect to appropriate dashboard
      if (userProfile && userProfile.role !== allowedRole) {
        if (userProfile.role === 'customer') {
          router.push('/customer/dashboard');
        } else {
          router.push('/seller/dashboard');
        }
      }
    }
  }, [user, userProfile, loading, router, allowedRole]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Wrong role
  if (!userProfile || userProfile.role !== allowedRole) {
    return null; // Will redirect in useEffect
  }

  // Authorized - show content
  return <>{children}</>;
}
