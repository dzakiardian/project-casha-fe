import React from 'react';
import { useSearchParams } from 'react-router';
import { products, getProductsByCategory } from '../data/products';
import { ProductCard } from '../components/product/ProductCard';

export const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');

  const filteredProducts = category
    ? getProductsByCategory(category)
    : products;

  const categoryTitle = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'Semua Produk';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">{categoryTitle}</h1>
        <p className="text-zinc-400">
          Menampilkan {filteredProducts.length} produk
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-400 text-lg">Tidak ada produk ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
