/**
 * Login Page
 * 
 * Features:
 * - Form validation using react-hook-form + Zod
 * - Firebase authentication
 * - Auto-redirect based on user role
 * - Error handling with user-friendly messages
 * - Loading states
 * 
 * Flow:
 * 1. User input email & password
 * 2. Validate form
 * 3. Login via Firebase
 * 4. Fetch user profile to get role
 * 5. Redirect: Customer → /dashboard, Seller → /seller/dashboard
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { loginSchema, LoginFormData } from '@/lib/validations/schemas';
import { loginUser, getUserProfile } from '@/lib/firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  /**
   * Initialize react-hook-form dengan Zod validation
   * 
   * zodResolver: Integrasikan Zod schema dengan react-hook-form
   * Otomatis handle validation errors dan show di UI
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  /**
   * Handle form submission
   * 
   * Flow:
   * 1. Validate form (auto by react-hook-form)
   * 2. Login via Firebase
   * 3. Get user role dari Firestore
   * 4. Redirect based on role
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError('');

      // Login user
      const userCredential = await loginUser(data.email, data.password);

      // Get user profile untuk check role
      const profile = await getUserProfile(userCredential.user.uid);

      if (!profile) {
        throw new Error('Profile tidak ditemukan');
      }

      // Redirect based on role
      if (profile.role === 'customer') {
        router.push('/customer/dashboard');
      } else {
        router.push('/seller/dashboard');
      }
    } catch (err) {
      // Show error message
      setError(err instanceof Error ? err.message : 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="mt-2 text-gray-600">Login to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="p-3 rounded bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                {...register('password')}
                id="password"
                type="password"
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </div>

          {/* Link to Register */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-orange-500 hover:text-orange-600"
              >
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
