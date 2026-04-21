import React from 'react';
import { Product } from '../../data/products';
import Link from 'next/link';
import Image from 'next/image';
import { BASE_IMAGE_URL } from '../base-api';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const basePrice = parseFloat(product.base_price);
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;

  const discount = discountPrice
    ? Math.round(((basePrice - discountPrice) / basePrice) * 100)
    : 0;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group bg-[#121212] border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-600 transition-all"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
        <Image
          src={`http://localhost:3001/uploads/${product.image}`}
          alt={product.name}
          width={500}
          height={500}
          quality={95}
          unoptimized
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-white text-black px-3 py-1 rounded-full text-xs font-semibold">
            -{discount}%
          </div>
        )}
        {product.stock < 5 && product.stock > 0 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Stok Terbatas
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-zinc-400 uppercase mb-1">{product.category.name}</p>
        <h3 className="text-white mb-2 group-hover:text-zinc-300 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-white">
            Rp {discountPrice ? discountPrice.toLocaleString('id-ID') : basePrice.toLocaleString('id-ID')}
          </span>
          {discountPrice && (
            <span className="text-sm text-zinc-500 line-through">
              Rp {basePrice.toLocaleString('id-ID')}
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-500 mt-2">Stok: {product.stock}</p>
      </div>
    </Link>
  );
};
