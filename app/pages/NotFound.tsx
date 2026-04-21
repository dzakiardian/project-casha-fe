import React from 'react';
import { Link } from 'react-router';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-white mb-4">404</h1>
        <h2 className="text-3xl font-bold text-white mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-zinc-400 mb-8">
          Halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
        </p>
        <Link
          to="/"
          className="inline-block bg-white text-black px-8 py-3 rounded-lg hover:bg-zinc-200 transition-colors"
        >
          Kembali ke Home
        </Link>
      </div>
    </div>
  );
};
