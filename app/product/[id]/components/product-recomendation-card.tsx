'use client'; // Wajib ada karena kita pakai State & Effect

import React, { useEffect, useState } from 'react';
import { ProductCard } from '@/app/components/product/ProductCard';

export const ProductRecomendationCard= ({ dataProduct }: any) => {
  console.log(dataProduct, 'daric')
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 2. Buat fungsi async di dalam useEffect
    const loadData = async () => {
      try {
        setFeaturedProducts(dataProduct);
      } catch (error) {
        console.error("Gagal load produk unggulan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  console.log(dataProduct.length > 0)

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Produk Rekomendasi</h2>
        <p className="text-zinc-400">Orang lain juga membeli produk dibawah ini</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Tampilkan loading saat data masih diambil
          <div className="col-span-full text-center text-zinc-500">
            Memuat produk rekomendasi...
          </div>
        ) : dataProduct?.length > 0 ? (
          // 3. Map datanya setelah dipastikan bukan Promise lagi tapi sudah jadi Array
          dataProduct?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center text-zinc-500">
            Tidak ada produk rekomendasi saat ini.
          </div>
        )}
      </div>
    </section>
  );
};