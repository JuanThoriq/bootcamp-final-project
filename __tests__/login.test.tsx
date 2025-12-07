/**
 * Unit Test untuk Login Page
 * 
 * Testing Strategy:
 * 1. Render test - Pastikan component render dengan benar
 * 2. Form validation - Test validasi email dan password
 * 3. Error handling - Test error messages
 * 
 * Best Practice:
 * - Test user behavior, bukan implementation details
 * - Use screen queries (getByRole, getByLabelText)
 * - Test accessibility
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Firebase auth functions
jest.mock('@/lib/firebase/auth', () => ({
  loginUser: jest.fn(),
  getUserProfile: jest.fn(),
}));

describe('LoginPage', () => {
  it('should render login form', () => {
    render(<LoginPage />);

    // Check if important elements are rendered
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    // Click submit button without filling form
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    // Check if validation errors are shown
    await waitFor(() => {
      expect(screen.getByText(/email harus diisi/i)).toBeInTheDocument();
      expect(screen.getByText(/password harus diisi/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    // Type invalid email
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');

    // Type valid password
    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'password123');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    // Check if validation error is shown
    await waitFor(() => {
      expect(screen.getByText(/format email tidak valid/i)).toBeInTheDocument();
    });
  });

  it('should show link to register page', () => {
    render(<LoginPage />);

    const registerLink = screen.getByRole('link', { name: /register here/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});
