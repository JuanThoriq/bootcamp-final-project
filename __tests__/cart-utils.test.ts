/**
 * Cart Utilities Tests
 * 
 * Testing cart operations:
 * - Add to cart with stock validation
 * - Update quantity
 * - Remove from cart
 */

import { addToCart, updateCartItemQuantity, removeFromCart } from '@/lib/firebase/cart';
import { getProductById } from '@/lib/firebase/products';
import { getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// Mock Firestore
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase/products');

describe('Cart Utilities', () => {
  const mockUserId = 'test-user-123';
  const mockProductId = 'test-product-123';
  
  const mockProduct = {
    id: mockProductId,
    name: 'Test Product',
    price: 50000,
    stock: 10,
    imageUrl: 'https://example.com/image.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getProductById as jest.Mock).mockResolvedValue(mockProduct);
  });

  describe('addToCart', () => {
    it('should add new item to cart', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      await addToCart(mockUserId, mockProductId, 2);

      expect(setDoc).toHaveBeenCalled();
      expect(getProductById).toHaveBeenCalledWith(mockProductId);
    });

    it('should throw error when stock insufficient', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      await expect(
        addToCart(mockUserId, mockProductId, 20)
      ).rejects.toThrow('Stok tidak mencukupi');
    });

    it('should update quantity for existing cart item', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ quantity: 2 }),
      });

      await addToCart(mockUserId, mockProductId, 3);

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('updateCartItemQuantity', () => {
    it('should delete item when quantity is 0', async () => {
      await updateCartItemQuantity(mockUserId, mockProductId, 0);

      expect(deleteDoc).toHaveBeenCalled();
    });

    it('should throw error when quantity exceeds stock', async () => {
      await expect(
        updateCartItemQuantity(mockUserId, mockProductId, 20)
      ).rejects.toThrow('Stok tidak mencukupi');
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      await removeFromCart(mockUserId, mockProductId);

      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});
