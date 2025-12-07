/**
 * Home Page
 * 
 * Landing page yang redirect user berdasarkan auth status:
 * - Logged in → Redirect to appropriate dashboard based on role
 * - Not logged in → Show welcome page with login/register buttons
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth-context';

export default function Home() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    // Auto-redirect jika user sudah login
    if (!loading && user && userProfile) {
      if (userProfile.role === 'customer') {
        router.push('/customer/dashboard');
      } else {
        router.push('/seller/dashboard');
      }
    }
  }, [user, userProfile, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Show welcome page untuk guest users
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-orange-50 to-orange-100 px-4">
      <div className="max-w-2xl text-center space-y-8">
        {/* Logo/Title */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            Welcome to Shopee Clone
          </h1>
          <p className="text-xl text-gray-600">
            Your one-stop e-commerce platform for buying and selling
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2 text-gray-900">
              For Customers
            </h3>
            <p className="text-gray-600 text-sm">
              Browse products, add to cart, and shop with ease
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2 text-gray-900">
              For Sellers
            </h3>
            <p className="text-gray-600 text-sm">
              Manage your products and grow your business
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            href="/login"
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-white hover:bg-gray-50 text-orange-500 font-medium rounded-lg border-2 border-orange-500 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
