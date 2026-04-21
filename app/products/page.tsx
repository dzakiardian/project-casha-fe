'use client'

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllProducts, getProductsByCategory, Product } from '../data/products';
import { ProductCard } from '../components/product/ProductCard';

export default function Products() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = category
          ? await getProductsByCategory(category)
          : await getAllProducts();
        setProducts(data);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]); // re-fetch kalau category berubah

  const categoryTitle = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'Semua Produk';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-zinc-800 rounded-lg h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">{categoryTitle}</h1>
        <p className="text-zinc-400">
          Menampilkan {products.length} produk
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-400 text-lg">Tidak ada produk ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}