/**
 * Customer Dashboard Page
 * 
 * Main dashboard untuk customer dengan:
 * - 10 random recommended products
 * - All products grid
 * - Click to view product detail
 * 
 * Protected Route: Only customers can access
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/protected-route';
import { useAuth } from '@/lib/contexts/auth-context';
import { Product } from '@/lib/types';
import { getAllProducts } from '@/lib/firebase/products';
import ProductCard from '@/components/customer/product-card';
import { ProductGridSkeleton } from '@/components/ui/skeletons';

export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute allowedRole="customer">
      <CustomerDashboardContent />
    </ProtectedRoute>
  );
}

function CustomerDashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const products = await getAllProducts();
      setAllProducts(products);

      // Get 10 random products for recommendations
      // Using Array.sort() with random + Array.slice()
      const shuffled = [...products].sort(() => Math.random() - 0.5);
      const recommended = shuffled.slice(0, 10);
      setRecommendedProducts(recommended);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user]);

  const handleProductClick = (productId: string) => {
    router.push(`/customer/product/${productId}`);
  };

  const handleLogout = async () => {
    const { logoutUser } = await import('@/lib/firebase/auth');
    await logoutUser();
    router.push('/login');
  };

  // Remove old loading state - we'll use skeletons inline instead

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Shopee Clone</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/customer/cart')}
                className="px-4 py-2 text-gray-700 hover:text-orange-500 font-medium transition-colors"
              >
                🛒 Cart
              </button>
              <button
                onClick={() => router.push('/customer/orders')}
                className="px-4 py-2 text-gray-700 hover:text-orange-500 font-medium transition-colors"
              >
                📦 Orders
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recommended Products Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                ✨ Recommended For You
              </h2>
              <p className="text-gray-600 mt-1">
                Top picks just for you
              </p>
            </div>
          </div>

          {loading ? (
            <ProductGridSkeleton count={10} />
          ) : recommendedProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">No recommended products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {recommendedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => handleProductClick(product.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* All Products Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                🛍️ All Products
              </h2>
              <p className="text-gray-600 mt-1">
                Browse our complete collection
              </p>
            </div>
          </div>

          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : allProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">No products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {allProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => handleProductClick(product.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
