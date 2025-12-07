/**
 * Product Card Component
 * 
 * Display product dalam card format untuk customer dashboard.
 * Clickable card yang redirect ke product detail page.
 * 
 * Props:
 * - product: Product data
 * - onClick: Handler when card clicked
 */

'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

/**
 * ProductCard component with React.memo for performance optimization.
 * Prevents re-renders when props haven't changed.
 */
function ProductCard({ product, onClick }: ProductCardProps) {
  // Format price ke Rupiah
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
    >
      {/* Product Image */}
      <div className="relative w-full h-48 bg-gray-100">
        <Image
          src={product.imageUrl || 'https://placehold.co/400x400/e5e7eb/6b7280?text=No+Image'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          unoptimized
        />
        
        {/* Stock Badge */}
        {product.stock > 0 && product.stock <= 10 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
            Only {product.stock} left!
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-10">
          {product.name}
        </h3>
        
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-orange-500">
            {formatPrice(product.price)}
          </span>
          
          <span className="text-xs text-gray-500">
            Stock: {product.stock}
          </span>
        </div>

        {/* Category Badge */}
        <div className="mt-2">
          <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 capitalize">
            {product.category}
          </span>
        </div>
      </div>
    </div>
  );
}

// Export memoized version for better performance
export default memo(ProductCard);
