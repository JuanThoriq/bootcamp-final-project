/**
 * Product List Component
 * 
 * Display seller's products dalam table format dengan:
 * - Filter by category
 * - Search by name
 * - Delete (single & multiple)
 * - Pagination
 * 
 * Simplified version tanpa shadcn/ui dulu untuk foundation
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product, ProductCategory } from '@/lib/types';
import { deleteProduct, deleteMultipleProducts } from '@/lib/firebase/products';
import { useDebounce } from '@/lib/hooks';
import ConfirmationModal from '@/components/ui/confirmation-modal';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  onProductsChange: () => void;
}

export default function ProductList({
  products,
  loading,
  onProductsChange,
}: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | ''>('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'single' | 'multiple'>('single');
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Debounce search untuk performance
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase());
    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedProducts.length === 0) return;
    setDeleteMode('multiple');
    setModalOpen(true);
  };

  const handleDeleteSingle = (productId: string) => {
    setProductToDelete(productId);
    setDeleteMode('single');
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      
      if (deleteMode === 'multiple') {
        await deleteMultipleProducts(selectedProducts);
        setSelectedProducts([]);
      } else if (productToDelete) {
        await deleteProduct(productToDelete);
      }
      
      onProductsChange();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeleting(false);
      setProductToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">
          No products yet. Add your first product!
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 flex gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as ProductCategory | '')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="food">Food</option>
            <option value="books">Books</option>
            <option value="toys">Toys</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Delete Selected Button */}
        {selectedProducts.length > 0 && (
          <button
            onClick={handleDeleteSelected}
            disabled={deleting}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors disabled:opacity-50"
          >
            {deleting
              ? 'Deleting...'
              : `Delete (${selectedProducts.length})`}
          </button>
        )}
      </div>

      {/* Products Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredProducts.length} of {products.length} products
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    filteredProducts.length > 0 &&
                    selectedProducts.length === filteredProducts.length
                  }
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Product
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Category
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Price
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 shrink-0">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full capitalize">
                    {product.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-900 font-medium">
                  Rp {product.price.toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-sm font-medium ${
                      product.stock > 10
                        ? 'text-green-600'
                        : product.stock > 0
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDeleteSingle(product.id)}
                    disabled={deleting}
                    className="text-red-600 hover:text-red-800 font-medium text-sm disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          {products.length === 0 ? (
            <>
              <div className="text-5xl mb-4">📦</div>
              <p className="text-gray-700 font-medium mb-2">Belum Ada Produk</p>
              <p className="text-gray-500 text-sm">Tambahkan produk pertama Anda di atas</p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-700 font-medium mb-2">Tidak Ada Hasil</p>
              <p className="text-gray-500 text-sm">Coba ubah filter atau kata kunci pencarian</p>
            </>
          )}
        </div>
      ) : null}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={deleteMode === 'multiple' ? 'Hapus Beberapa Produk?' : 'Hapus Produk?'}
        message={
          deleteMode === 'multiple'
            ? `Apakah Anda yakin ingin menghapus ${selectedProducts.length} produk yang dipilih?`
            : 'Apakah Anda yakin ingin menghapus produk ini?'
        }
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
}
