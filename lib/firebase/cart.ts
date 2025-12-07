/**
 * Firebase Cart Utilities
 * 
 * Centralized functions untuk cart operations.
 * Cart disimpan di Firestore: carts/{userId}/items/{productId}
 * 
 * Collections Structure:
 * - carts/{userId}/items/{productId} - Cart item documents
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { CartItem } from '@/lib/types';
import { getProductById } from './products';

/**
 * Add or update item in cart
 * 
 * @param userId - User ID
 * @param productId - Product ID
 * @param quantity - Quantity to add/set
 * @returns Updated cart item
 */
export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<CartItem> => {
  try {
    // Get product details
    const product = await getProductById(productId);
    if (!product) {
      throw new Error('Produk tidak ditemukan');
    }

    // Validate stock
    if (product.stock < quantity) {
      throw new Error('Stok tidak mencukupi');
    }

    const cartItemRef = doc(db, 'carts', userId, 'items', productId);
    const cartItemSnap = await getDoc(cartItemRef);

    if (cartItemSnap.exists()) {
      // Update existing cart item
      const existingItem = cartItemSnap.data() as CartItem;
      const newQuantity = existingItem.quantity + quantity;

      // Validate total quantity against stock
      if (newQuantity > product.stock) {
        throw new Error('Stok tidak mencukupi');
      }

      await updateDoc(cartItemRef, {
        quantity: newQuantity,
        updatedAt: Timestamp.now(),
      });

      return {
        ...existingItem,
        quantity: newQuantity,
      };
    } else {
      // Create new cart item
      const newCartItem: CartItem = {
        id: productId,
        productId,
        product,
        quantity,
        addedAt: Timestamp.now(),
      };

      await setDoc(cartItemRef, newCartItem);
      return newCartItem;
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error instanceof Error ? error : new Error('Gagal menambahkan ke keranjang');
  }
};

/**
 * Get all cart items for a user
 * 
 * @param userId - User ID
 * @returns Array of cart items with product details
 */
export const getCartItems = async (userId: string): Promise<CartItem[]> => {
  try {
    const cartItemsRef = collection(db, 'carts', userId, 'items');
    const querySnapshot = await getDocs(cartItemsRef);

    const cartItems: CartItem[] = [];
    querySnapshot.forEach((doc) => {
      cartItems.push({
        productId: doc.id,
        ...doc.data(),
      } as CartItem);
    });

    return cartItems;
  } catch (error) {
    console.error('Error getting cart items:', error);
    throw new Error('Gagal mengambil data keranjang');
  }
};

/**
 * Update cart item quantity
 * 
 * @param userId - User ID
 * @param productId - Product ID
 * @param quantity - New quantity (0 to remove)
 */
export const updateCartItemQuantity = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<void> => {
  try {
    const cartItemRef = doc(db, 'carts', userId, 'items', productId);

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await deleteDoc(cartItemRef);
      return;
    }

    // Validate stock
    const product = await getProductById(productId);
    if (!product) {
      throw new Error('Produk tidak ditemukan');
    }

    if (quantity > product.stock) {
      throw new Error('Stok tidak mencukupi');
    }

    await updateDoc(cartItemRef, {
      quantity,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error instanceof Error ? error : new Error('Gagal mengubah jumlah produk');
  }
};

/**
 * Remove item from cart
 * 
 * @param userId - User ID
 * @param productId - Product ID
 */
export const removeFromCart = async (
  userId: string,
  productId: string
): Promise<void> => {
  try {
    const cartItemRef = doc(db, 'carts', userId, 'items', productId);
    await deleteDoc(cartItemRef);
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw new Error('Gagal menghapus produk dari keranjang');
  }
};

/**
 * Clear entire cart
 * 
 * @param userId - User ID
 */
export const clearCart = async (userId: string): Promise<void> => {
  try {
    const cartItemsRef = collection(db, 'carts', userId, 'items');
    const querySnapshot = await getDocs(cartItemsRef);

    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw new Error('Gagal mengosongkan keranjang');
  }
};

/**
 * Get cart item count
 * 
 * @param userId - User ID
 * @returns Total number of items in cart
 */
export const getCartItemCount = async (userId: string): Promise<number> => {
  try {
    const cartItems = await getCartItems(userId);
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
};
