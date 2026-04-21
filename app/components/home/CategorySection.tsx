'use client';

import React, { useEffect, useState } from 'react';
import { Category } from '../../data/categories';
import Link from 'next/link';
import axios from 'axios';
import { BASE_API_URI, BASE_IMAGE_URL } from '../base-api';

export const CategorySection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    axios({
      url: `${BASE_API_URI}/categories`,
      method: 'GET',
    })
    .then((res) => {
      setCategories(res.data.data);
      setIsLoading(false);
    })
    .catch((err) => {
      console.log(err);
      setIsLoading(false);
    })
  }, []);

  return (
    <section className="container mx-auto px-4 py-16 bg-[#121212]">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Kategori Produk</h2>
        <p className="text-zinc-400">Jelajahi koleksi berdasarkan kategori</p>
      </div>
      {isLoading ? (
        <div className='text-center font-semibold text-2xl h-14 text-white'>Memuat data Kategori</div>
      ):(
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.name.toLowerCase()}`}
              className="group relative h-64 rounded-lg overflow-hidden"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${BASE_IMAGE_URL}/${category.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>

              <div className="relative h-full flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                <p className="text-zinc-300 text-sm mb-1">{category.description}</p>
                <span className="text-zinc-400 text-xs">{category.tag}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};
