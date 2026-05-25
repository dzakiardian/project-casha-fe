'use client';

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { usePathname } from "next/navigation";


// Tambahkan tipe props { children }
export const Layout = ({ children }: { children: React.ReactNode }) => {
  
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith("/dashboard");

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col font-sans">
      {!isAdminPage && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
};