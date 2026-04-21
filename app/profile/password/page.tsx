'use client';

import React, { useState } from 'react';
import { ProfileSidebar } from '../../components/layout/ProfileSidebar';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

export default function ChangePassword() {
  const { changePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }

    setIsLoading(true);

    try {
      await changePassword(oldPassword, newPassword);
      toast.success('Password berhasil diubah');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Gagal mengubah password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Akun Saya</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <ProfileSidebar />

        <div className="lg:col-span-3">
          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Ganti Password</h2>

            <form onSubmit={handleSubmit} className="max-w-md space-y-5">
              <div>
                <label className="block text-sm text-zinc-300 mb-2">
                  Password Lama
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan password lama"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-300 mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-300 mb-2">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-white text-black px-6 py-3 rounded-lg hover:bg-zinc-200 transition-colors disabled:bg-zinc-700 disabled:text-zinc-500"
              >
                {isLoading ? 'Menyimpan...' : 'Ubah Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
