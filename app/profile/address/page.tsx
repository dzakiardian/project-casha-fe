"use client";

import React, { useEffect, useState } from "react";
import { ProfileSidebar } from "../../components/layout/ProfileSidebar";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, MapPin, Loader2 } from "lucide-react"; // Tambah Loader2
import { clientFetch } from "@/lib/apiFetch";

export default function AddressSettings() {
  const { user } = useAuth();

  // 1. State untuk menangani Hydration
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [address, setAddress] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    label: "",
    fullName: "",
    phoneNumber: "",
    detail: "",
    province: "",
    city: "",
    district: "",
    subDistrict: "",
    postalCode: "",
    originId: "",
    isPrimary: false,
  });

  const locationMap: Record<string, any> = {
    "83012": {
      subDistrict: "Dekoro",
      district: "Pekalongan Timur",
      city: "Kota Pekalongan",
      province: "Jawa Tengah",
    },
    "69140": {
      subDistrict: "Sumub kidul",
      district: "Sragi",
      city: "Kab Pekalongan",
      province: "Jawa Tengah",
    },
    "65448": {
      subDistrict: "Kasepuhan",
      district: "Batang",
      city: "Kab Batang",
      province: "Jawa Tengah",
    },
    "67509": {
      subDistrict: "Randudongkal",
      district: "Randudongkal",
      city: "Kab Pemalang",
      province: "Jawa Tengah",
    },
    "72304": {
      subDistrict: "Kemandungan",
      district: "Tegal Barat",
      city: "Kota Tegal",
      province: "Jawa Tengah",
    },
    "64990": {
      subDistrict: "Tambakaji",
      district: "Ngaliyan",
      city: "Kota Semarang",
      province: "Jawa Tengah",
    },
  };

  // 2. Handle Hydration & Fetching
  useEffect(() => {
    setMounted(true);
    fetchAddress();
  }, []);

  async function fetchAddress() {
    try {
      setIsLoading(true);
      const res = await clientFetch("/address");
      setAddress(res.data || []);
    } catch (error) {
      console.error("Fetch Address Error:", error);
      toast.error("Gagal mengambil data alamat");
    } finally {
      setIsLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({
      label: "",
      recipientName: "",
      phone: "",
      fullAddress: "",
      city: "",
      postalCode: "",
      isDefault: false,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await clientFetch(`/address/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(formData),
        });
        toast.success("Alamat berhasil diperbarui");
      } else {
        await clientFetch("/address", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        toast.success("Alamat berhasil ditambahkan");
      }
      fetchAddress();
      resetForm();
    } catch (error) {
      console.log(error)
      toast.error("Gagal menyimpan alamat");
    }
  };

  const handleEdit = (addr: any) => {
    setFormData({
      label: addr.label,
      fullName: addr.fullName,
      phoneNumber: addr.phoneNumber,
      detail: addr.detail,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      subDistrict: addr.subDistrict,
      postalCode: addr.postalCode,
      originId: addr.originId,
      isPrimary: addr.isPrimary,
    });
    setEditingId(addr.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus alamat ini?")) {
      try {
        await clientFetch(`/address/${id}`, { method: 'DELETE' });
        setAddress(address.filter((a) => a.id !== id));
        toast.success("Alamat berhasil dihapus");
      } catch (error) {
        toast.error("Gagal menghapus alamat");
      }
    }
  };

  // 3. Cegah render jika belum mounted (Solusi utama Hydration Error)
  if (!mounted) return null;

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
                {/* Baris 1: Label & Nama */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-300 mb-2">
                      Label Alamat
                    </label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) =>
                        setFormData({ ...formData, label: e.target.value })
                      }
                      placeholder="Rumah / Kantor"
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-300 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                </div>

                {/* Baris 2: Nomor Telepon & Kode Pos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-300 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-300 mb-2">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) =>
                        setFormData({ ...formData, postalCode: e.target.value })
                      }
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                </div>

                {/* Baris 3: Pilih Lokasi (Origin ID) */}
                <div>
                  <label className="block text-sm text-zinc-300 mb-2">
                    Pilih Wilayah
                  </label>
                  <select
                    value={formData.originId}
                    onChange={(e) => {
                      const val = e.target.value;
                      const info = locationMap[val] || {};
                      setFormData({
                        ...formData,
                        originId: val,
                        subDistrict: info.subDistrict || "",
                        district: info.district || "",
                        city: info.city || "",
                        province: info.province || "",
                      });
                    }}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-zinc-600"
                  >
                    <option value="">Pilih Wilayah...</option>
                    <option value="83012">
                      Dekoro, Pekalongan Timur, Kota Pekalongan
                    </option>
                    <option value="69140">
                      Sumub kidul, Sragi, Kab Pekalongan
                    </option>
                    <option value="65448">Kasepuhan, Batang, Kab Batang</option>
                    <option value="67509">
                      Randudongkal, Randudongkal, Kab Pemalang
                    </option>
                    <option value="72304">
                      Kemandungan, Tegal Barat, Kota Tegal
                    </option>
                    <option value="64990">
                      Tambakaji, Ngaliyan, Kota Semarang
                    </option>
                  </select>
                </div>

                {/* Read-only fields (Otomatis terisi dari Select) */}
                {formData.originId && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-zinc-500 italic">
                    <span>Kec: {formData.district}</span>
                    <span>Kel: {formData.subDistrict}</span>
                    <span>{formData.city}</span>
                    <span>{formData.province}</span>
                  </div>
                )}

                {/* Baris 4: Alamat Detail */}
                <div>
                  <label className="block text-sm text-zinc-300 mb-2">
                    Detail Alamat (Jalan, No Rumah, Blok)
                  </label>
                  <textarea
                    value={formData.detail}
                    onChange={(e) =>
                      setFormData({ ...formData, detail: e.target.value })
                    }
                    rows={3}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-zinc-600 resize-none"
                  />
                </div>

                {/* Checkbox Utama */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer w-fit">
                    <input
                      type="checkbox"
                      checked={formData.isPrimary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isPrimary: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-white"
                    />
                    <span className="text-sm text-zinc-300">
                      Jadikan alamat utama
                    </span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
                  >
                    {editingId ? "Perbarui Alamat" : "Simpan Alamat"}
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
                {isLoading ? (
                  <div className="flex flex-col items-center py-12">
                    <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                    <p className="text-zinc-500 text-sm">Memuat alamat...</p>
                  </div>
                ) : address.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-400">Belum ada alamat tersimpan</p>
                  </div>
                ) : (
                  address.map((addr) => (
                    <div
                      key={addr.id}
                      className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-white font-semibold">
                              {addr.label}
                            </h3>
                            {addr.isPrimary && (
                              <span className="text-[10px] bg-white text-black font-bold px-2 py-0.5 rounded uppercase">
                                Utama
                              </span>
                            )}
                          </div>
                          <p className="text-zinc-300 mb-1 text-sm">
                            {addr.fullName} | {addr.phoneNumber}
                          </p>
                          <p className="text-zinc-400 text-sm">{addr.detail}</p>
                          <p className="text-zinc-400 text-sm">
                            {addr.city}, {addr.postalCode}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(addr)}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(addr.id)}
                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
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
}
