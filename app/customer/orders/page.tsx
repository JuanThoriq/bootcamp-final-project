/**
 * Order History Page
 * 
 * Display order history dengan:
 * - Orders grouped by Order ID
 * - Show order date
 * - Show product image, name, quantity
 * - Show price per product line
 * - Show total price per order
 * 
 * Uses Array.reduce() for grouping (as per requirements)
 * 
 * Protected Route: Only customers can access
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ProtectedRoute from '@/components/auth/protected-route';
import { useAuth } from '@/lib/contexts/auth-context';
import { Order } from '@/lib/types';
import { getOrdersByCustomer } from '@/lib/firebase/orders';
import { Timestamp } from 'firebase/firestore';

export default function OrderHistoryPage() {
  return (
    <ProtectedRoute allowedRole="customer">
      <OrderHistoryContent />
    </ProtectedRoute>
  );
}

function OrderHistoryContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const fetchedOrders = await getOrdersByCustomer(user.uid);
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
        setError('Gagal memuat riwayat pesanan');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Group orders by order ID using Array.reduce() (as per requirements)
  // Note: Since each order is already separate, this demonstrates the reduce pattern
  const groupedOrders = orders.reduce<{ [key: string]: Order }>(
    (acc, order) => {
      acc[order.id] = order;
      return acc;
    },
    {}
  );

  // Loading will be handled inline

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push('/customer/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              ← Back to Dashboard
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/customer/cart')}
                className="px-4 py-2 text-gray-700 hover:text-orange-500 font-medium transition-colors"
              >
                🛒 Cart
              </button>
              <span className="text-sm text-gray-600">{user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">📦 Order History</h1>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-pulse space-y-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-16 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Pesanan</h2>
            <p className="text-gray-500 mb-6">Kamu belum pernah melakukan pembelian. Yuk, mulai belanja!</p>
            <button
              onClick={() => router.push('/customer/dashboard')}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              Jelajahi Produk
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Loop through grouped orders */}
            {Object.values(groupedOrders).map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-mono text-sm font-medium text-gray-900">
                        {order.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Tanggal Pesanan</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <div key={index} className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="relative w-20 h-20 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-gray-900 mb-1">
                            {item.productName}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Quantity: {item.quantity}</span>
                            <span>×</span>
                            <span>{formatPrice(item.priceAtPurchase)}</span>
                          </div>
                        </div>

                        {/* Item Subtotal */}
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">Subtotal</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatPrice(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        ✓ {order.status === 'completed' ? 'Completed' : order.status}
                      </span>
                      <span className="text-sm text-gray-600">
                        {order.items.length} item(s)
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Total Pesanan</p>
                      <p className="text-2xl font-bold text-orange-500">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Summary Stats */}
        {orders.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ringkasan Pesanan
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-500">{orders.length}</p>
                <p className="text-sm text-gray-600 mt-1">Total Orders</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-500">
                  {orders.reduce((total, order) => total + order.items.length, 0)}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Items</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-500">
                  {formatPrice(
                    orders.reduce((total, order) => total + order.totalAmount, 0)
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Spending</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
