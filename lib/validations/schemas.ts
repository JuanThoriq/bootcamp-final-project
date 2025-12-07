/**
 * Form Validation Schemas using Zod
 * 
 * Zod adalah library untuk schema validation yang type-safe.
 * 
 * Keuntungan pakai Zod:
 * - Type-safe: TypeScript types auto-generated dari schema
 * - Runtime validation: Check data saat runtime
 * - Clear error messages: Custom error messages
 * - Integration: Works seamlessly dengan react-hook-form
 */

import { z } from 'zod';

/**
 * Login Form Validation Schema
 * 
 * Rules:
 * - Email: Required, must be valid email format
 * - Password: Required, minimum 6 characters
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email harus diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Password harus diisi')
    .min(6, 'Password minimal 6 karakter'),
});

/**
 * Register Form Validation Schema
 * 
 * Rules:
 * - Email: Required, must be valid email format
 * - Password: Required, minimum 6 characters
 * - Confirm Password: Required, must match password
 * - Role: Required, must be 'customer' or 'seller'
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email harus diisi')
      .email('Format email tidak valid'),
    password: z
      .string()
      .min(1, 'Password harus diisi')
      .min(6, 'Password minimal 6 karakter'),
    confirmPassword: z
      .string()
      .min(1, 'Konfirmasi password harus diisi'),
    role: z.enum(['customer', 'seller'], {
      message: 'Pilih role: Customer atau Seller',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'], // Error akan muncul di field confirmPassword
  });

/**
 * Product Form Validation Schema
 * 
 * Rules:
 * - Name: Required, minimum 6 characters
 * - Description: Required
 * - Price: Required, must be positive number
 * - Stock: Required, must be positive integer
 * - Category: Required
 */
export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama produk harus diisi')
    .min(6, 'Nama produk minimal 6 karakter'),
  description: z
    .string()
    .min(1, 'Deskripsi produk harus diisi'),
  price: z
    .number({
      message: 'Harga harus berupa angka',
    })
    .positive('Harga harus lebih dari 0'),
  stock: z
    .number({
      message: 'Stok harus berupa angka',
    })
    .int('Stok harus berupa bilangan bulat')
    .positive('Stok harus lebih dari 0'),
  category: z.enum(
    ['electronics', 'fashion', 'food', 'books', 'toys', 'sports', 'other'],
    {
      message: 'Pilih kategori produk',
    }
  ),
});

// Export inferred types dari schemas
// Ini akan auto-generate TypeScript types dari Zod schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
