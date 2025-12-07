/**
 * Seller Dashboard Page
 * 
 * Main dashboard untuk seller dengan:
 * - Add product form
 * - Product list/management
 * - Statistics (optional untuk future)
 * 
 * Protected Route: Only sellers can access
 */

'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/protected-route';
import SellerLayout from '@/components/seller/seller-layout';
import AddProductForm from '@/components/seller/add-product-form';
import ProductList from '@/components/seller/product-list';
import { useAuth } from '@/lib/contexts/auth-context';
import { Product } from '@/lib/types';
import { getProductsBySeller } from '@/lib/firebase/products';

export default function SellerDashboardPage() {
  return (
    <ProtectedRoute allowedRole="seller">
      <SellerLayout>
        <SellerDashboardContent />
      </SellerLayout>
    </ProtectedRoute>
  );
}

function SellerDashboardContent() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadProducts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const fetchedProducts = await getProductsBySeller(user.uid);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load products saat component mount
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Re-fetch when user changes

  const handleProductAdded = () => {
    setShowAddForm(false);
    loadProducts(); // Refresh product list
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
          <p className="text-gray-600 mt-1">
            Manage your product inventory
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* Add Product Form (conditional) */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add New Product
          </h3>
          <AddProductForm onSuccess={handleProductAdded} />
        </div>
      )}

      {/* Product List */}
      <div className="bg-white rounded-lg shadow-md">
        <ProductList
          products={products}
          loading={loading}
          onProductsChange={loadProducts}
        />
      </div>
    </div>
  );
}
