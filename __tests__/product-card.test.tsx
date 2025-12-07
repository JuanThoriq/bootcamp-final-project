/**
 * Product Card Tests
 * 
 * Testing:
 * - Renders product information correctly
 * - Clickable functionality
 * - Price formatting (Rupiah)
 * - Stock badge display
 */

import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '@/components/customer/product-card';
import { Product } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('ProductCard Component', () => {
  const mockProduct: Product = {
    id: 'test-product-1',
    sellerId: 'seller-1',
    name: 'Test Product',
    description: 'Test description',
    price: 50000,
    stock: 5,
    category: 'electronics',
    imageUrl: 'https://example.com/image.jpg',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const mockOnClick = jest.fn();

  it('should render product information', () => {
    render(<ProductCard product={mockProduct} onClick={mockOnClick} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText(/Rp 50.000/i)).toBeInTheDocument();
    expect(screen.getByText(/Stock: 5/i)).toBeInTheDocument();
    expect(screen.getByText(/electronics/i)).toBeInTheDocument();
  });

  it('should show stock badge when stock is low (<=10)', () => {
    render(<ProductCard product={mockProduct} onClick={mockOnClick} />);
    
    expect(screen.getByText(/Only 5 left!/i)).toBeInTheDocument();
  });

  it('should not show stock badge when stock is sufficient', () => {
    const productWithHighStock = { ...mockProduct, stock: 20 };
    render(<ProductCard product={productWithHighStock} onClick={mockOnClick} />);
    
    expect(screen.queryByText(/Only.*left!/i)).not.toBeInTheDocument();
  });

  it('should call onClick when card is clicked', () => {
    render(<ProductCard product={mockProduct} onClick={mockOnClick} />);
    
    const card = screen.getByText('Test Product').closest('div');
    fireEvent.click(card!);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should format price in Indonesian Rupiah', () => {
    render(<ProductCard product={mockProduct} onClick={mockOnClick} />);
    
    // Check for Rupiah symbol
    expect(screen.getByText(/Rp/i)).toBeInTheDocument();
  });

  it('should display product image', () => {
    render(<ProductCard product={mockProduct} onClick={mockOnClick} />);
    
    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockProduct.imageUrl);
  });
});
