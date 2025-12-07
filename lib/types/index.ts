/**
 * TypeScript Type Definitions
 * 
 * Centralized type definitions untuk seluruh aplikasi.
 * Best Practice: Definisikan semua types di satu tempat untuk maintainability.
 */

import { Timestamp } from 'firebase/firestore';

/**
 * User Roles
 * - customer: Can browse, purchase products
 * - seller: Can manage products
 */
export type UserRole = 'customer' | 'seller';

/**
 * User Profile (disimpan di Firestore)
 */
export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp;
}

/**
 * Product Categories
 */
export type ProductCategory = 
  | 'electronics'
  | 'fashion'
  | 'food'
  | 'books'
  | 'toys'
  | 'sports'
  | 'other';

/**
 * Product (disimpan di Firestore)
 */
export interface Product {
  id: string;
  sellerId: string; // User ID yang create product
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  imageUrl: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Cart Item (disimpan di Firestore di subcollection)
 */
export interface CartItem {
  id: string;
  productId: string;
  product: Product; // Denormalized untuk kemudahan
  quantity: number;
  addedAt: Timestamp;
}

/**
 * Order Status
 */
export type OrderStatus = 'pending' | 'completed' | 'cancelled';

/**
 * Order Item (product dalam order)
 */
export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  priceAtPurchase: number; // Simpan harga saat beli
  subtotal: number;
}

/**
 * Order (disimpan di Firestore)
 */
export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Timestamp;
}

/**
 * Form Data Types (untuk react-hook-form)
 */

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  image?: FileList;
}
