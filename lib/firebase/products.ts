/**
 * Firebase Product Utilities
 * 
 * Centralized functions untuk product CRUD operations.
 * Semua interaction dengan Firestore products collection ada di sini.
 * 
 * Collections Structure:
 * - products/{productId} - Product documents
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';
import { Product, ProductCategory } from '@/lib/types';

/**
 * Upload product image ke Firebase Storage
 * 
 * @param file - Image file
 * @param sellerId - Seller's user ID
 * @returns Image URL
 */
export const uploadProductImage = async (
  file: File,
  sellerId: string
): Promise<string> => {
  try {
    // Create unique filename: sellers/{sellerId}/products/{timestamp}_{filename}
    const timestamp = Date.now();
    const filename = `sellers/${sellerId}/products/${timestamp}_${file.name}`;
    const storageRef = ref(storage, filename);

    // Upload file
    await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Gagal upload gambar. Silakan coba lagi.');
  }
};

/**
 * Delete product image dari Firebase Storage
 * 
 * @param imageUrl - Image URL to delete
 */
export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract path from URL
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch (error) {
    // Ignore error if image doesn't exist
    console.error('Error deleting image:', error);
  }
};

/**
 * Default product image URL (placeholder)
 */
const DEFAULT_IMAGE_URL = 'https://placehold.co/400x400/e5e7eb/6b7280?text=No+Image';

/**
 * Add new product to Firestore
 * 
 * @param productData - Product data
 * @param sellerId - Seller's user ID
 * @param imageFile - Optional image file
 * @returns Created product with ID
 */
export const addProduct = async (
  productData: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: ProductCategory;
  },
  sellerId: string,
  imageFile?: File
): Promise<Product> => {
  try {
    // Upload image if provided, otherwise use default
    let imageUrl = DEFAULT_IMAGE_URL;
    if (imageFile) {
      imageUrl = await uploadProductImage(imageFile, sellerId);
    }

    const now = Timestamp.now();

    // Create product document
    const productRef = await addDoc(collection(db, 'products'), {
      sellerId,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock,
      category: productData.category,
      imageUrl,
      createdAt: now,
      updatedAt: now,
    });

    // Return product with ID
    return {
      id: productRef.id,
      sellerId,
      ...productData,
      imageUrl,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Error adding product:', error);
    throw new Error('Gagal menambahkan produk. Silakan coba lagi.');
  }
};

/**
 * Get products by seller ID
 * 
 * @param sellerId - Seller's user ID
 * @param filters - Optional filters (category, search)
 * @returns Array of products
 */
export const getProductsBySeller = async (
  sellerId: string,
  filters?: {
    category?: ProductCategory;
    searchTerm?: string;
  }
): Promise<Product[]> => {
  try {
    // Simple query - hanya filter by sellerId (no composite index needed)
    const constraints: QueryConstraint[] = [
      where('sellerId', '==', sellerId),
    ];

    // Add category filter if provided
    if (filters?.category) {
      constraints.push(where('category', '==', filters.category));
    }

    const q = query(collection(db, 'products'), ...constraints);
    const querySnapshot = await getDocs(q);

    let products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        ...data,
      } as Product);
    });

    // Client-side sorting by createdAt (descending - newest first)
    products.sort((a, b) => {
      const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
      return bTime - aTime; // Descending order
    });

    // Client-side search filter (Firestore doesn't support text search)
    if (filters?.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      products = products.filter((product) =>
        product.name.toLowerCase().includes(searchLower)
      );
    }

    return products;
  } catch (error) {
    console.error('Error getting products:', error);
    throw new Error('Gagal mengambil data produk. Silakan coba lagi.');
  }
};

/**
 * Get all products (untuk customer)
 * 
 * @returns Array of all products with stock > 0
 */
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    // Simple query - get all products
    const q = query(collection(db, 'products'));
    const querySnapshot = await getDocs(q);

    let products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        ...data,
      } as Product);
    });

    // Client-side filtering: Only products with stock > 0
    products = products.filter((product) => product.stock > 0);

    // Client-side sorting: Newest first
    products.sort((a, b) => {
      const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
      return bTime - aTime; // Descending order
    });

    return products;
  } catch (error) {
    console.error('Error getting all products:', error);
    throw new Error('Gagal mengambil data produk. Silakan coba lagi.');
  }
};

/**
 * Get product by ID
 * 
 * @param productId - Product ID
 * @returns Product or null
 */
export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const productDoc = await getDoc(doc(db, 'products', productId));

    if (productDoc.exists()) {
      return {
        id: productDoc.id,
        ...productDoc.data(),
      } as Product;
    }

    return null;
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
};

/**
 * Update product
 * 
 * @param productId - Product ID
 * @param updates - Fields to update
 * @param imageFile - Optional new image file
 */
export const updateProduct = async (
  productId: string,
  updates: Partial<Omit<Product, 'id' | 'sellerId' | 'createdAt'>>,
  imageFile?: File
): Promise<void> => {
  try {
    const updateData: DocumentData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Upload new image if provided
    if (imageFile) {
      // Get old product to delete old image
      const oldProduct = await getProductById(productId);
      if (oldProduct && oldProduct.imageUrl !== DEFAULT_IMAGE_URL) {
        await deleteProductImage(oldProduct.imageUrl);
      }

      // Upload new image
      const product = await getProductById(productId);
      if (product) {
        updateData.imageUrl = await uploadProductImage(imageFile, product.sellerId);
      }
    }

    await updateDoc(doc(db, 'products', productId), updateData);
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Gagal mengupdate produk. Silakan coba lagi.');
  }
};

/**
 * Delete product (dan imagenya)
 * 
 * @param productId - Product ID
 */
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    // Get product to delete image
    const product = await getProductById(productId);

    if (product && product.imageUrl !== DEFAULT_IMAGE_URL) {
      await deleteProductImage(product.imageUrl);
    }

    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Gagal menghapus produk. Silakan coba lagi.');
  }
};

/**
 * Delete multiple products
 * 
 * @param productIds - Array of product IDs
 */
export const deleteMultipleProducts = async (productIds: string[]): Promise<void> => {
  try {
    await Promise.all(productIds.map((id) => deleteProduct(id)));
  } catch (error) {
    console.error('Error deleting multiple products:', error);
    throw new Error('Gagal menghapus produk. Silakan coba lagi.');
  }
};
