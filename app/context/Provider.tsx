'use client';


import { Toaster } from 'sonner';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <Toaster position="top-center" theme="dark" />
      </CartProvider>
    </AuthProvider>
  );
}