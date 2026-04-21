'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Pesan Anda telah dikirim! Kami akan segera menghubungi Anda.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-6 text-center">
          Hubungi Kami
        </h1>
        <p className="text-zinc-400 text-center text-lg mb-12">
          Ada pertanyaan? Kami siap membantu Anda
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div>
            <div className="bg-[#121212] border border-zinc-800 rounded-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-white mb-6">Informasi Kontak</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email</h3>
                    <p className="text-zinc-400">support@mahenstore.com</p>
                    <p className="text-zinc-400">info@mahenstore.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Telepon</h3>
                    <p className="text-zinc-400">+62 812-3456-7890</p>
                    <p className="text-zinc-400">+62 821-9876-5432</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Alamat</h3>
                    <p className="text-zinc-400">
                      Jl. Thrift Fashion No. 123
                      <br />
                      Jakarta Selatan, DKI Jakarta
                      <br />
                      Indonesia 12345
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Jam Operasional</h3>
                    <p className="text-zinc-400">Senin - Jumat: 09.00 - 18.00 WIB</p>
                    <p className="text-zinc-400">Sabtu: 09.00 - 15.00 WIB</p>
                    <p className="text-zinc-400">Minggu: Tutup</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#121212] border border-zinc-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Ikuti Kami</h2>
              <p className="text-zinc-400 mb-4">
                Dapatkan update terbaru tentang produk dan promo kami
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-white hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-lg">📷</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-white hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-lg">📘</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-white hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-lg">🐦</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-white hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-lg">💬</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Kirim Pesan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-300 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                  placeholder="Nama Anda"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-300 mb-2">Subjek</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                  placeholder="Subjek pesan"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-300 mb-2">Pesan</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 resize-none"
                  placeholder="Tulis pesan Anda di sini..."
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                <Send className="w-5 h-5" />
                Kirim Pesan
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
