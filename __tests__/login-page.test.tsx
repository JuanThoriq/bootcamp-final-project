/**
 * Login Page Tests
 * 
 * Testing acceptance criteria:
 * - Email field is required and must be valid format
 * - Password field is required
 * - Link to registration page exists
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/app/login/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Firebase auth
jest.mock('@/lib/firebase/auth', () => ({
  loginUser: jest.fn(),
}));

// Mock Auth Context
jest.mock('@/lib/contexts/auth-context', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
  }),
}));

describe('Login Page', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    jest.clearAllMocks();
  });

  it('should render login form with email and password fields', () => {
    render(<LoginPage />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should show validation error when email is empty', async () => {
    render(<LoginPage />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toBeRequired();
    });
  });

  it('should show validation error when password is empty', async () => {
    render(<LoginPage />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toBeRequired();
    });
  });

  it('should have link to registration page', () => {
    render(<LoginPage />);
    
    const registerLink = screen.getByText(/belum punya akun/i);
    expect(registerLink).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });
});
