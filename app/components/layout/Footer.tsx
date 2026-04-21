import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#121212] border-t border-zinc-800 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Mahen Store</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Toko thrift terpercaya dengan koleksi pakaian berkualitas dan harga terjangkau.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Menu</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-zinc-400 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-zinc-400 hover:text-white transition-colors text-sm">
                  Produk
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-zinc-400 hover:text-white transition-colors text-sm">
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Kategori</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=kemeja" className="text-zinc-400 hover:text-white transition-colors text-sm">
                  Kemeja
                </Link>
              </li>
              <li>
                <Link href="/products?category=celana" className="text-zinc-400 hover:text-white transition-colors text-sm">
                  Celana
                </Link>
              </li>
              <li>
                <Link href="/products?category=jaket" className="text-zinc-400 hover:text-white transition-colors text-sm">
                  Jaket
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-zinc-400 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Jl. Contoh No. 123, Jakarta</span>
              </li>
              <li className="flex items-center gap-2 text-zinc-400 text-sm">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2 text-zinc-400 text-sm">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>info@mahenstore.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-8 pt-8 text-center">
          <p className="text-zinc-500 text-sm">
            © 2026 Mahen Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
