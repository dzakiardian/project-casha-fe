'use client'; // Wajib karena pakai hook

import React, { useEffect, useState } from 'react';
import { getRandomProducts, Product } from '../../data/products';
import { ProductCard } from '../product/ProductCard';

export const RandomProducts: React.FC = () => {
  // 1. Siapkan state untuk nampung array produk
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Fungsi pembantu buat nungguin data asinkronus
    const fetchRandom = async () => {
      try {
        // Kita "await" alias tungguin sampai data dari backend beneran dateng
        const data = await getRandomProducts(8);
        setProducts(data);
      } catch (error) {
        console.error("Gagal ambil produk acak:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRandom();
  }, []);

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Produk Lainnya</h2>
        <p className="text-zinc-400">Temukan lebih banyak koleksi menarik</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Skeleton atau loading state sederhana
          <div className="col-span-full text-center text-zinc-500 py-10">
            Mengambil produk menarik untuk Anda...
          </div>
        ) : products.length > 0 ? (
          // 3. Render setelah datanya fix jadi Array
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center text-zinc-500 py-10">
            Belum ada produk yang tersedia.
          </div>
        )}
      </div>
    </section>
  );
};