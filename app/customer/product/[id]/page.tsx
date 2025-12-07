/**
 * Product Detail Page
 * 
 * Display detailed product information dengan:
 * - Product image, name, price, stock, description
 * - Add to cart functionality
 * - Quantity input with stock validation
 * - Back button to dashboard
 * 
 * Protected Route: Only customers can access
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import ProtectedRoute from '@/components/auth/protected-route';
import { useAuth } from '@/lib/contexts/auth-context';
import { Product } from '@/lib/types';
import { getProductById } from '@/lib/firebase/products';
import { addToCart } from '@/lib/firebase/cart';

export default function ProductDetailPage() {
  return (
    <ProtectedRoute allowedRole="customer">
      <ProductDetailContent />
    </ProtectedRoute>
  );
}

function ProductDetailContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const fetchedProduct = await getProductById(productId);
        
        if (!fetchedProduct) {
          setError('Produk tidak ditemukan');
          return;
        }

        setProduct(fetchedProduct);
      } catch (error) {
        console.error('Error loading product:', error);
        setError('Gagal memuat detail produk');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleQuantityChange = (newQuantity: number) => {
    if (!product) return;

    if (newQuantity < 1) {
      setQuantity(1);
      return;
    }

    if (newQuantity > product.stock) {
      setError(`Stok hanya tersedia ${product.stock} unit`);
      setQuantity(product.stock);
      return;
    }

    setQuantity(newQuantity);
    setError('');
  };

  const handleAddToCart = async () => {
    if (!user || !product) return;

    try {
      setAdding(true);
      setError('');
      setSuccess('');

      await addToCart(user.uid, product.id, quantity);
      
      setSuccess(`${quantity} produk berhasil ditambahkan ke keranjang!`);
      setQuantity(1);

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambahkan ke keranjang');
    } finally {
      setAdding(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Produk tidak ditemukan</p>
          <button
            onClick={() => router.push('/customer/dashboard')}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              ← Back
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center space-x-3">
                  <span className="inline-block px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-600 capitalize">
                    {product.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    Stock: {product.stock} unit
                  </span>
                </div>
              </div>

              <div className="text-4xl font-bold text-orange-500">
                {formatPrice(product.price)}
              </div>

              <div className="border-t border-b border-gray-200 py-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Deskripsi Produk
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Add to Cart Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">
                    Jumlah:
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-20 text-center py-2 border-x border-gray-300 focus:outline-none"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="p-3 rounded bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 rounded bg-green-50 border border-green-200">
                    <p className="text-sm text-green-600">{success}</p>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={adding || product.stock === 0}
                  className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adding
                    ? 'Menambahkan...'
                    : product.stock === 0
                    ? 'Stok Habis'
                    : '🛒 Tambahkan ke Keranjang'}
                </button>

                {/* Additional Info */}
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• Pastikan jumlah sesuai kebutuhan Anda</p>
                  <p>• Stok tersedia: {product.stock} unit</p>
                  <p>• Harga dapat berubah sewaktu-waktu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
