/**
 * Cart Page
 * 
 * Display dan manage cart items dengan:
 * - View all cart items
 * - Update quantity (increase/decrease)
 * - Remove items
 * - Show total price
 * - Stock validation
 * - Checkout (create order)
 * 
 * Protected Route: Only customers can access
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ProtectedRoute from '@/components/auth/protected-route';
import { useAuth } from '@/lib/contexts/auth-context';
import { CartItem } from '@/lib/types';
import { getCartItems, updateCartItemQuantity, removeFromCart } from '@/lib/firebase/cart';
import { createOrderFromCart } from '@/lib/firebase/orders';
import { CartItemSkeleton } from '@/components/ui/skeletons';
import ConfirmationModal from '@/components/ui/confirmation-modal';

export default function CartPage() {
  return (
    <ProtectedRoute allowedRole="customer">
      <CartContent />
    </ProtectedRoute>
  );
}

function CartContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'delete' | 'checkout' | 'success'>('delete');
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  const loadCart = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const items = await getCartItems(user.uid);
      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart:', error);
      setError('Gagal memuat keranjang');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (!user) return;

    try {
      setError('');

      // Optimistic update - update UI immediately
      setCartItems(prev => 
        prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      // Update in background
      await updateCartItemQuantity(user.uid, productId, newQuantity);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah jumlah');
      // Rollback on error
      await loadCart();
    }
  };

  const handleRemove = (productId: string, productName: string) => {
    setProductToDelete({ id: productId, name: productName });
    setModalType('delete');
    setModalOpen(true);
  };

  const confirmRemove = async () => {
    if (!user || !productToDelete) return;

    try {
      setUpdating(true);
      setError('');

      // Optimistic update - remove from UI immediately
      setCartItems(prev => prev.filter(item => item.productId !== productToDelete.id));

      await removeFromCart(user.uid, productToDelete.id);
      // No need to reload - already updated optimistically
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus produk');
      // Rollback on error
      await loadCart();
    } finally {
      setUpdating(false);
      setProductToDelete(null);
    }
  };

  const handleCheckout = () => {
    if (!user) return;

    // Validate all items have sufficient stock
    const insufficientStock = cartItems.filter(
      (item) => item.product.stock < item.quantity
    );

    if (insufficientStock.length > 0) {
      setError(
        `Stok tidak mencukupi untuk: ${insufficientStock
          .map((item) => item.product.name)
          .join(', ')}`
      );
      return;
    }

    // Show checkout confirmation modal
    setModalType('checkout');
    setModalOpen(true);
  };

  const confirmCheckout = async () => {
    if (!user) return;

    setModalOpen(false);

    try {
      setCheckingOut(true);
      setError('');

      await createOrderFromCart(user.uid);
      
      // Show success modal
      setModalType('success');
      setModalOpen(true);
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        router.push('/customer/orders');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal checkout');
    } finally {
      setCheckingOut(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const allItemsAvailable = cartItems.every(
    (item) => item.product.stock >= item.quantity
  );

  // Loading state will be handled inline with skeletons

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
                onClick={() => router.push('/customer/orders')}
                className="px-4 py-2 text-gray-700 hover:text-orange-500 font-medium transition-colors"
              >
                📦 Orders
              </button>
              <span className="text-sm text-gray-600">{user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🛒 Shopping Cart</h1>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
            {[...Array(3)].map((_, i) => (
              <CartItemSkeleton key={i} />
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-16 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Keranjang Kosong</h2>
            <p className="text-gray-500 mb-6">Yuk, mulai belanja dan temukan produk favoritmu!</p>
            <button
              onClick={() => router.push('/customer/dashboard')}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              Mulai Belanja Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
              {cartItems.map((item) => {
                const isInsufficientStock = item.product.stock < item.quantity;
                const itemTotal = item.product.price * item.quantity;

                return (
                  <div
                    key={item.productId}
                    className={`p-6 ${isInsufficientStock ? 'bg-red-50' : ''}`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="relative w-24 h-24 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          Stock: {item.product.stock} unit
                        </p>
                        <p className="text-lg font-bold text-orange-500">
                          {formatPrice(item.product.price)}
                        </p>

                        {isInsufficientStock && (
                          <p className="text-sm text-red-600 mt-2">
                            ⚠️ Stok tidak mencukupi! Tersedia: {item.product.stock}
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end space-y-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.productId, item.quantity - 1)
                            }
                            disabled={updating || item.quantity <= 1}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            −
                          </button>
                          <span className="w-12 text-center py-1 border-x border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.productId, item.quantity + 1)
                            }
                            disabled={updating || item.quantity >= item.product.stock}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <p className="text-sm text-gray-600">
                          Subtotal: {formatPrice(itemTotal)}
                        </p>

                        <button
                          onClick={() => handleRemove(item.productId, item.product.name)}
                          disabled={updating}
                          className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">
                    {cartItems.reduce((total, item) => total + item.quantity, 0)} unit
                  </span>
                </div>

                <div className="flex justify-between items-center text-2xl font-bold border-t pt-3">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-orange-500">{formatPrice(calculateTotal())}</span>
                </div>

                {!allItemsAvailable && (
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded">
                    ⚠️ Beberapa produk memiliki stok tidak mencukupi. Silakan ubah jumlah
                    atau hapus produk tersebut.
                  </p>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut || !allItemsAvailable || cartItems.length === 0}
                  className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingOut ? 'Processing...' : '💳 Checkout'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Dengan checkout, pesanan akan langsung dibuat dan stok akan dikurangi
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={modalType === 'delete' ? confirmRemove : modalType === 'checkout' ? confirmCheckout : () => router.push('/customer/orders')}
        title={
          modalType === 'delete'
            ? 'Hapus dari Keranjang?'
            : modalType === 'checkout'
            ? 'Konfirmasi Checkout'
            : 'Pesanan Berhasil! ✅'
        }
        message={
          modalType === 'delete'
            ? productToDelete
              ? `Apakah Anda yakin ingin menghapus "${productToDelete.name}" dari keranjang?`
              : ''
            : modalType === 'checkout'
            ? `Lanjutkan checkout? Pesanan akan dibuat dan stok produk akan dikurangi.`
            : 'Pesanan Anda berhasil dibuat! Mengarahkan ke halaman pesanan...'
        }
        confirmText={
          modalType === 'delete' ? 'Hapus' : modalType === 'checkout' ? 'Lanjutkan' : 'OK'
        }
        cancelText={modalType === 'success' ? undefined : 'Batal'}
        type={modalType === 'delete' ? 'danger' : modalType === 'checkout' ? 'warning' : 'info'}
      />
    </div>
  );
}
