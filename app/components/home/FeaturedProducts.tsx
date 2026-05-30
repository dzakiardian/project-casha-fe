'use client'; // Wajib ada karena kita pakai State & Effect

import React, { useEffect, useState } from 'react';
import { getFeaturedProducts, Product } from '../../data/products';
import { ProductCard } from '../product/ProductCard';
import { clientFetch } from '@/lib/apiFetch';

export const FeaturedProducts: React.FC = () => {
  // 1. Siapkan state untuk menampung array produk
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 2. Buat fungsi async di dalam useEffect
    const loadData = async () => {
      try {
        const res = await clientFetch("/products/bestseller");

        const filterData = res.data ? res.data.filter((data: { stock: number }) => data.stock > 0) : [];
        setFeaturedProducts(filterData);
      } catch (error) {
        console.error("Gagal load produk unggulan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Produk Unggulan</h2>
        <p className="text-zinc-400">Koleksi terbaik pilihan kami untuk Anda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Tampilkan loading saat data masih diambil
          <div className="col-span-full text-center text-zinc-500">
            Memuat produk unggulan...
          </div>
        ) : featuredProducts.length > 0 ? (
          // 3. Map datanya setelah dipastikan bukan Promise lagi tapi sudah jadi Array
          featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center text-zinc-500">
            Tidak ada produk unggulan saat ini.
          </div>
        )}
      </div>
    </section>
  );
};