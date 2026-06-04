"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  CheckCircle,
  X,
  ShoppingBag,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Cookies from "js-cookie";
import { clientFetch } from "@/lib/apiFetch";
import Image from "next/image";
import { BASE_IMAGE_URL } from "../components/base-api";

interface PendingOrder {
  id: string;
  orderCode: string;
  createdAt: Date;
  shippingCost: string;
  product: {
    name: string;
    image: string;
  };
  size: string;
  status: string;
  totalAmount: string;
  itemCount?: number; // Tambahan properti info pelengkap
}

export default function PaymentProof() {
  const router = useRouter();
  const params = useParams();
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [dataOrders, setDataOrders] = useState<PendingOrder[]>([]);

  const fetchOrders = async () => {
    try {
      const res = await clientFetch("/orders");
      const ordPnd = res.data.filter((itm: { status: string }) => itm.status === "pending");

      // ─── LOGIKA KUNCI GABUNG CARD INVOICE KEMBAR ───
      const groupedMap: { [key: string]: PendingOrder } = {};

      ordPnd.forEach((order: any) => {
        const code = order.orderCode;
        if (!groupedMap[code]) {
          // Jika kode invoice belum terdaftar, masukkan sebagai data dasar card utama
          groupedMap[code] = {
            ...order,
            itemCount: 1,
            // Simpan nilai total amount awal dalam bentuk angka
            totalAmount: String(parseFloat(order.totalAmount || "0"))
          };
        } else {
          // JIKA KODE INVOICE KEMBAR: Akumulasikan total tagihan biayanya jadi satu kesatuan
          const currentTotal = parseFloat(groupedMap[code].totalAmount);
          const nextTotal = parseFloat(order.totalAmount || "0");
          
          groupedMap[code].totalAmount = String(currentTotal + nextTotal);
          groupedMap[code].itemCount = (groupedMap[code].itemCount || 1) + 1;
        }
      });

      // Mengubah object map kembali menjadi array bersih untuk dibaca .map() react loop
      const finalGroupedOrders = Object.values(groupedMap);

      setDataOrders(finalGroupedOrders);

      // Jika ada orderId dari params atau data cuma ada 1 invoice gabungan, auto-select
      const paramOrderId = params?.orderId as string | undefined;
      if (paramOrderId) {
        const found = finalGroupedOrders.find((o) => o.id === paramOrderId);
        if (found) setSelectedOrder(found);
      } else if (finalGroupedOrders.length === 1) {
        setSelectedOrder(finalGroupedOrders[0]);
      }

    } catch (error) {
      console.error("Gagal memuat riwayat pesanan:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSelectOrder = (order: PendingOrder) => {
    setSelectedOrder(order);
    setProofImage(null);
    setPreviewUrl("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setProofImage(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrder) {
      toast.error("Pilih pesanan terlebih dahulu");
      return;
    }

    if (!proofImage) {
      toast.error("Silakan upload bukti pembayaran");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("orderCode", selectedOrder.orderCode);
      formData.append("photoUrl", proofImage);

      await clientFetch(`/payments/upload`, {
        method: "POST",
        body: formData,
      });

      Cookies.remove("pendingOrder");
      toast.success("Bukti pembayaran berhasil diupload!");
      router.push("/profile/orders");
    } catch (error) {
      console.error(error);
      toast.error("Gagal upload bukti pembayaran");
    } finally {
      setIsUploading(false);
    }
  };

  const isOrderSelected = (order: PendingOrder) =>
    selectedOrder?.orderCode === order.orderCode;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Upload Bukti Pembayaran
            </h1>
            <p className="text-zinc-400">
              Pilih pesanan yang ingin Anda upload bukti pembayarannya
            </p>
          </div>
          <button
            onClick={() => router.push("/profile/orders")}
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Kembali
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List Pending Orders */}
          <div className="lg:col-span-1">
            <div className="bg-[#121212] border border-zinc-800 rounded-lg p-4">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Pesanan Pending ({dataOrders.length})
              </h2>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {dataOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => handleSelectOrder(order)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isOrderSelected(order)
                        ? "border-white bg-zinc-900"
                        : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <input
                        type="radio"
                        name="selected-order"
                        checked={isOrderSelected(order)}
                        onChange={() => handleSelectOrder(order)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm mb-1 truncate">
                          #{order.orderCode}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                          <Clock className="w-3 h-3" />
                          <span>
                            {format(new Date(order.createdAt), "dd MMM yyyy", {
                              locale: id,
                            })}
                          </span>
                        </div>
                        <p className="text-emerald-500 font-medium text-xs">
                          {order.itemCount && order.itemCount > 1 
                            ? `${order.itemCount} Produk Gabungan` 
                            : "1 Produk"}
                        </p>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="border-t border-zinc-800 pt-3">
                      <div className="flex items-center gap-2">
                        {order.product.image && (
                          <Image
                            src={`${BASE_IMAGE_URL}/${order.product.image}`}
                            alt={order.product.name}
                            width={400}
                            height={400}
                            unoptimized
                            className="w-8 h-10 object-cover rounded"
                          />
                        )}
                        <p className="text-white text-xs truncate flex-1">
                          {order.product.name} {order.itemCount && order.itemCount > 1 ? "..." : ""}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-3">
                      <p className="text-xs text-zinc-400">Total Pembayaran</p>
                      <p className="text-white font-bold text-sm">
                        Rp {parseFloat(order.totalAmount).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upload Form */}
          <div className="lg:col-span-2">
            {!selectedOrder ? (
              <div className="bg-[#121212] border border-zinc-800 rounded-lg p-12 text-center">
                <ShoppingBag className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400 text-lg">
                  Pilih pesanan yang ingin diupload bukti pembayarannya
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-6 h-6 text-white" />
                    <h2 className="text-xl font-bold text-white">
                      Detail Pesanan
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-zinc-400 text-sm">ID Pesanan</p>
                      <p className="text-white font-semibold">
                        {selectedOrder.orderCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-sm">Tanggal</p>
                      <p className="text-white">
                        {format(
                          new Date(selectedOrder.createdAt),
                          "dd MMMM yyyy HH:mm",
                          { locale: id },
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-sm">Asal Pengiriman</p>
                      <p className="text-white">
                        Sumub Kidul, Sragi, Kabupaten Pekalongan
                      </p>
                    </div>
                    {selectedOrder.shippingCost && (
                      <div>
                        <p className="text-zinc-400 text-sm">Kurir</p>
                        <p className="text-white">JNT</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-4">
                    Ringkasan Pembayaran
                  </h3>
                  <div className="border-t border-zinc-800 pt-2 flex justify-between text-white">
                    <span className="font-bold">Total Pembayaran</span>
                    <span className="font-bold text-xl text-blue-400">
                      Rp{" "}
                      {parseFloat(selectedOrder.totalAmount).toLocaleString(
                        "id-ID",
                      )}
                    </span>
                  </div>
                </div>

                <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-3">
                    Informasi Rekening
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-zinc-400">Bank BCA</p>
                    <p className="text-white font-mono text-lg">1234567890</p>
                    <p className="text-zinc-400">a.n. Mahen Store</p>
                  </div>
                </div>

                <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Upload Bukti Transfer
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-zinc-400 text-sm mb-3">
                        Bukti Pembayaran (JPG, PNG, max 5MB)
                      </label>
                      {!previewUrl ? (
                        <label className="border-2 border-dashed border-zinc-700 rounded-lg p-8 cursor-pointer hover:border-zinc-600 transition-colors block">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <div className="text-center">
                            <Upload className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
                            <p className="text-white mb-1">Klik untuk upload</p>
                            <p className="text-zinc-500 text-sm">
                              atau drag & drop file di sini
                            </p>
                          </div>
                        </label>
                      ) : (
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full rounded-lg border border-zinc-800"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setProofImage(null);
                              setPreviewUrl("");
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Tips Upload Bukti Transfer:
                      </h4>
                      <ul className="text-zinc-400 text-sm space-y-1 list-disc list-inside">
                        <li>Pastikan foto jelas dan mudah dibaca</li>
                        <li>Nominal transfer sesuai dengan total pembayaran</li>
                        <li>Tanggal dan waktu transfer terlihat jelas</li>
                        <li>Nama pengirim dan penerima terlihat</li>
                      </ul>
                    </div>

                    <button
                      type="submit"
                      disabled={!proofImage || isUploading}
                      className="w-full bg-white text-black py-3 rounded-lg hover:bg-zinc-200 transition-colors font-semibold disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-zinc-500 border-t-black rounded-full animate-spin" />
                          Mengupload...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Konfirmasi Pembayaran
                        </>
                      )}
                    </button>

                    <p className="text-zinc-500 text-xs text-center">
                      Dengan mengupload bukti pembayaran, pesanan Anda akan
                      segera diproses setelah verifikasi admin (maksimal 1x24 jam)
                    </p>
                  </form>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ <span className="font-semibold">Penting:</span> Pastikan
                    Anda melakukan transfer sebelum upload bukti pembayaran.
                    Pesanan akan otomatis dibatalkan jika tidak ada konfirmasi
                    dalam 24 jam.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}