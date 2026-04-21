import React from 'react';
import { useSearchParams } from 'react-router';
import { searchProducts } from '../data/products';
import { ProductCard } from '../components/product/ProductCard';
import { Search } from 'lucide-react';

export const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const searchResults = searchProducts(query);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-8 h-8 text-zinc-400" />
          <h1 className="text-4xl font-bold text-white">
            Hasil Pencarian
          </h1>
        </div>
        <p className="text-zinc-400">
          Menampilkan {searchResults.length} hasil untuk "{query}"
        </p>
      </div>

      {searchResults.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-12 max-w-md mx-auto">
            <Search className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Tidak ada produk ditemukan
            </h3>
            <p className="text-zinc-400">
              Coba gunakan kata kunci yang berbeda
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {searchResults.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
