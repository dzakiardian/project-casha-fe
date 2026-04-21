'use client';

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

// Tambahkan tipe props { children }
export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col font-sans">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};