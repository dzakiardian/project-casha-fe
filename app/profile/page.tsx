'use client';

import React, { useEffect, useState } from 'react';
import { ProfileSidebar } from '../components/layout/ProfileSidebar';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { User, Phone, Mail } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.numberPhone || '');
  const [email, setEmail] = useState(user?.email || '');

  useEffect(() => {
    document.title = "Mahen Store - Profile";
  }, []);

  const handleSave = () => {
    // updateProfile({ name, phone, email });
    setIsEditing(false);
    toast.success('Profil berhasil diperbarui');
  };

  useEffect(() => {
  if (user) {
    setName(user.fullName || '');
    setPhone(user.numberPhone || '');
    setEmail(user.email || '');
  }
}, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Akun Saya</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <ProfileSidebar />

        <div className="lg:col-span-3">
          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Detail Profil</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm bg-zinc-800 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Edit Profil
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-zinc-300 mb-2">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-300 mb-2">Nomor Telepon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="bg-white text-black px-6 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setName(user?.name || '');
                      setPhone(user?.phone || '');
                      setEmail(user?.email || '');
                    }}
                    className="bg-zinc-800 text-white px-6 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
