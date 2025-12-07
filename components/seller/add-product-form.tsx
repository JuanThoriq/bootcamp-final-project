/**
 * Add Product Form Component
 * 
 * Form untuk add product dengan:
 * - Form validation (react-hook-form + Zod)
 * - Image upload preview
 * - Firebase Storage upload
 * - Firestore save
 * 
 * Best Practices:
 * - Controlled form dengan validation
 * - Image preview sebelum upload
 * - Error handling
 * - Loading states
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/contexts/auth-context';
import { addProduct } from '@/lib/firebase/products';
import { ProductCategory } from '@/lib/types';

interface AddProductFormProps {
  onSuccess: () => void;
}

interface ProductFormInputs {
  name: string;
  description: string;
  price: string; // Input as string, convert to number
  stock: string; // Input as string, convert to number
  category: ProductCategory;
  image?: FileList;
}

export default function AddProductForm({ onSuccess }: AddProductFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormInputs>();

  const onSubmit = async (data: ProductFormInputs) => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      // Validate fields manually
      if (!data.name || data.name.trim().length < 6) {
        setError('Nama produk minimal 6 karakter');
        return;
      }

      if (!data.description || data.description.trim().length === 0) {
        setError('Deskripsi produk harus diisi');
        return;
      }

      if (!data.category) {
        setError('Kategori harus dipilih');
        return;
      }

      const price = parseFloat(data.price);
      if (isNaN(price) || price <= 0) {
        setError('Harga harus lebih dari 0');
        return;
      }

      const stock = parseInt(data.stock);
      if (isNaN(stock) || stock <= 0) {
        setError('Stok harus lebih dari 0');
        return;
      }

      // Prepare product data
      const productData = {
        name: data.name.trim(),
        description: data.description.trim(),
        price: price,
        stock: stock,
        category: data.category,
      };

      // Add product (no image - uses default placeholder)
      await addProduct(productData, user.uid);

      // Reset form
      reset();
      
      // Call success callback
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambahkan produk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Product Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Product Name *
            </label>
            <input
              {...register('name')}
              id="name"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., iPhone 15 Pro"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category *
            </label>
            <select
              {...register('category')}
              id="category"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="food">Food & Beverage</option>
              <option value="books">Books</option>
              <option value="toys">Toys</option>
              <option value="sports">Sports</option>
              <option value="other">Other</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Price (Rp) *
            </label>
            <input
              {...register('price')}
              id="price"
              type="number"
              step="0.01"
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="50000"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Stock Quantity *
            </label>
            <input
              {...register('stock')}
              id="stock"
              type="number"
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="100"
            />
            {errors.stock && (
              <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description *
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={5}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Detailed product description..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Note: Image upload disabled (Storage not available) */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              📷 <strong>Image Upload:</strong> Currently disabled. All products will use a default placeholder image.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Adding Product...' : 'Add Product'}
        </button>
      </div>
    </form>
  );
}
