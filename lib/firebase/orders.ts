/**
 * Firebase Order Utilities
 * 
 * Centralized functions untuk order operations.
 * Orders disimpan di Firestore: orders/{orderId}
 * 
 * Collections Structure:
 * - orders/{orderId} - Order documents
 */

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  writeBatch,
  doc,
} from 'firebase/firestore';
import { db } from './config';
import { Order, OrderItem } from '@/lib/types';
import { getCartItems, clearCart } from './cart';
import { getProductById } from './products';

/**
 * Create order from cart items
 * 
 * @param userId - User ID
 * @returns Created order
 */
export const createOrderFromCart = async (userId: string): Promise<Order> => {
  try {
    // Get cart items
    const cartItems = await getCartItems(userId);
    
    if (cartItems.length === 0) {
      throw new Error('Keranjang kosong');
    }

    // Validate stock and prepare order items
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const cartItem of cartItems) {
      const product = await getProductById(cartItem.productId);
      
      if (!product) {
        throw new Error(`Produk ${cartItem.product.name} tidak ditemukan`);
      }

      if (product.stock < cartItem.quantity) {
        throw new Error(
          `Stok ${product.name} tidak mencukupi. Tersedia: ${product.stock}, Diminta: ${cartItem.quantity}`
        );
      }

      const subtotal = product.price * cartItem.quantity;
      
      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        quantity: cartItem.quantity,
        priceAtPurchase: product.price,
        subtotal,
      });

      totalAmount += subtotal;
    }

    // Create order in Firestore
    const orderData = {
      customerId: userId,
      items: orderItems,
      totalAmount,
      status: 'completed' as const,
      createdAt: Timestamp.now(),
    };

    const orderRef = await addDoc(collection(db, 'orders'), orderData);

    // Update product stock using batch
    const batch = writeBatch(db);
    
    for (const item of orderItems) {
      const product = await getProductById(item.productId);
      if (product) {
        const productRef = doc(db, 'products', item.productId);
        batch.update(productRef, {
          stock: product.stock - item.quantity,
          updatedAt: Timestamp.now(),
        });
      }
    }

    await batch.commit();

    // Clear cart after successful order
    await clearCart(userId);

    return {
      id: orderRef.id,
      ...orderData,
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error instanceof Error ? error : new Error('Gagal membuat pesanan');
  }
};

/**
 * Get orders by customer ID
 * 
 * @param customerId - Customer user ID
 * @returns Array of orders
 */
export const getOrdersByCustomer = async (customerId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('customerId', '==', customerId)
    );

    const querySnapshot = await getDocs(q);

    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      } as Order);
    });

    // Client-side sorting: Newest first
    orders.sort((a, b) => {
      const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
      return bTime - aTime; // Descending order
    });

    return orders;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw new Error('Gagal mengambil data pesanan');
  }
};
