import React, { useState } from 'react';
import { ProfileSidebar } from '../components/layout/ProfileSidebar';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';

export const AddressSettings: React.FC = () => {
  const { user, addAddress, updateAddress, deleteAddress } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: '',
    recipientName: '',
    phone: '',
    fullAddress: '',
    city: '',
    postalCode: '',
    isDefault: false,
  });

  const resetForm = () => {
    setFormData({
      label: '',
      recipientName: '',
      phone: '',
      fullAddress: '',
      city: '',
      postalCode: '',
      isDefault: false,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateAddress(editingId, formData);
      toast.success('Alamat berhasil diperbarui');
    } else {
      addAddress(formData);
      toast.success('Alamat berhasil ditambahkan');
    }

    resetForm();
  };

  const handleEdit = (address: any) => {
    setFormData(address);
    setEditingId(address.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus alamat ini?')) {
      deleteAddress(id);
      toast.success('Alamat berhasil dihapus');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Akun Saya</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <ProfileSidebar />

        <div className="lg:col-span-3">
          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Alamat Saya</h2>
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-2 text-sm bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Alamat
                </button>
              )}
            </div>

            {isAdding ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-300 mb-2">Label</label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      placeholder="Contoh: Rumah, Kantor"
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-300 mb-2">Nama Penerima</label>
                    <input
                      type="text"
                      value={formData.recipientName}
                      onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-zinc-300 mb-2">Nomor Telepon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-300 mb-2">Alamat Lengkap</label>
                  <textarea
                    value={formData.fullAddress}
                    onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                    rows={3}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-300 mb-2">Kota</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-300 mb-2">Kode Pos</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4 accent-white"
                    />
                    <span className="text-sm text-zinc-300">Jadikan alamat utama</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="bg-white text-black px-6 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                  >
                    {editingId ? 'Perbarui' : 'Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-zinc-800 text-white px-6 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {user?.addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-400">Belum ada alamat tersimpan</p>
                  </div>
                ) : (
                  user?.addresses.map((address) => (
                    <div
                      key={address.id}
                      className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-white font-semibold">{address.label}</h3>
                            {address.isDefault && (
                              <span className="text-xs bg-white text-black px-2 py-1 rounded">
                                Utama
                              </span>
                            )}
                          </div>
                          <p className="text-zinc-300 mb-1">
                            {address.recipientName} | {address.phone}
                          </p>
                          <p className="text-zinc-400 text-sm">
                            {address.fullAddress}
                          </p>
                          <p className="text-zinc-400 text-sm">
                            {address.city}, {address.postalCode}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(address)}
                            className="text-zinc-400 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(address.id)}
                            className="text-zinc-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
