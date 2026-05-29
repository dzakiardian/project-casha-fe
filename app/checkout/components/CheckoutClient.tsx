"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { clientFetch } from "@/lib/apiFetch";
import Image from "next/image";
import { BASE_IMAGE_URL } from "@/app/components/base-api";
import Cookies from "js-cookie";

type Address = { id: string; label: string; isPrimary: boolean; fullName: string; phoneNumber: string; detail: string; city: string; postalCode: string; originId?: string };

// ─── PERBAIKAN 1: Destructuring Props dengan Tipe Data yang Benar ───
interface CheckoutClientProps {
  address: any[];       // List alamat dari wrapper
  itemProducts: any[];  // List produk terseleksi dari wrapper
}

export default function CheckoutClient({ address: addressList, itemProducts }: CheckoutClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [shippingServices, setShippingServices] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [isLoadingOngkir, setIsLoadingOngkir] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hitung total harga barang yang murni dipilih saja
  const totalPrice = itemProducts?.reduce((accumulator, item) => {
    const subtotal = (item.product.discount_price || item.product.price) * item.qty;
    return accumulator + subtotal;
  }, 0) || 0;

  useEffect(() => {
    if (addressList && Array.isArray(addressList)) {
      const defaultAddress = addressList.find((addr: any) => addr.isPrimary);
      setSelectedAddress(defaultAddress ?? addressList[0]);
    }
  }, [addressList]);

  const handleCheckOngkir = async () => {
    if (!selectedAddress) return;
    setIsLoadingOngkir(true);
    try {
      const response = await fetch("/api/ongkir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: "69140",
          destination: selectedAddress?.originId || "34361",
          weight: "1000",
          courier: "jnt",
        }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const json = await response.json();
      setShippingServices(json.data || []);
    } catch (error) {
      console.error("Ongkir error:", error);
    } finally {
      setIsLoadingOngkir(false);
    }
  };

  useEffect(() => {
    if (selectedAddress) {
      const timer = setTimeout(() => {
        handleCheckOngkir();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedAddress]);

  // ─── PERBAIKAN 2: Handler Checkout Satu Kali Tembak Sesuai Struktur Backend Array ───
  const handleCheckout = async () => {
    if (!selectedAddress) return toast.error("Pilih alamat pengiriman terlebih dahulu");
    if (!selectedShipping) return toast.error("Pilih layanan pengiriman terlebih dahulu");
    if (!itemProducts || itemProducts.length === 0) return toast.error("Produk pesanan kosong");

    setIsSubmitting(true);

    try {
      // 1. Petakan data item menjadi bentuk array untuk dikirim ke backend
      const formattedItems = itemProducts.map((item: any) => ({
        productId: item.product.id,
        qty: item.qty,
        size: item.size || "M",
        color: item.color || "-",
        weight: item.product.weight || "1000",
      }));

      // Pembagian rata biaya ongkir dan asuransi per item untuk database orders
      const dividedShippingCost = Math.round(selectedShipping.cost / itemProducts.length);

      const payload = {
        items: formattedItems, // ─── HARUS BERNAMA ITEMS SUPAYA LOLOS IF BACKEND ───
        shippingCost: dividedShippingCost,
        insuranceCost: 0,
        notes: "Checkout Split Invoice",
      };

      // 2. Tembak CUKUP SEKALI ke endpoint checkout backend kita
      const res = await clientFetch("/orders/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.success) {
        throw new Error(res.message || "Gagal memproses pesanan di server");
      }

      toast.success("Semua invoice pesanan berhasil di-split otomatis!");

      // 3. Simpan data tracking pending order ke Cookies untuk halaman pembayaran
      const cookiesPayload = res.data.map((order: any) => ({
        orderId: order.orderId,
        orderCode: order.orderCode,
        date: new Date().toISOString(),
        origin: "Sumub Kidul, Kecamatan Kesesi, Kabupaten Pekalongan",
        selectedCourier: selectedShipping,
        totalPrice: totalPrice + selectedShipping.cost,
      }));

      Cookies.set("pendingOrder", JSON.stringify(cookiesPayload), { expires: 1 });

      document.location.href = '/pembayaran';
      // router.refresh();
    } catch (error: any) {
      console.error("Error saat checkout:", error);
      toast.error(error.message || "Gagal membuat pesanan. Coba lagi ya Bang.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Section Alamat */}
          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Alamat Pengiriman</h2>
            {!addressList || addressList.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-400 mb-4">Belum ada alamat tersimpan</p>
                <button onClick={() => router.push("/profile/address")} className="bg-white text-black px-6 py-2 rounded-lg hover:bg-zinc-200 transition-colors">
                  Tambah Alamat
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addressList.map((addr: any) => (
                  <label key={addr.id} className={`block border rounded-lg p-4 cursor-pointer transition-colors ${selectedAddress?.id === addr.id ? "border-white bg-zinc-900" : "border-zinc-800 hover:border-zinc-700"}`}>
                    <input type="radio" name="address" checked={selectedAddress?.id === addr.id} onChange={() => setSelectedAddress(addr)} className="hidden" />
                    <div>
                      <p className="text-white font-semibold mb-1">
                        {addr.label} {addr.isPrimary && <span className="ml-2 text-xs bg-zinc-700 px-2 py-1 rounded">Default</span>}
                      </p>
                      <p className="text-zinc-400 text-sm mb-1">{addr.fullName} | {addr.phoneNumber}</p>
                      <p className="text-zinc-400 text-sm">{addr.detail}, {addr.city}, {addr.postalCode}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Pengiriman */}
          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Pilih Pengiriman</h2>
            {isLoadingOngkir ? (
              <div className="flex items-center gap-2 text-zinc-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Menghitung ongkir J&T...</div>
            ) : shippingServices.length > 0 ? (
              <div className="space-y-2">
                {shippingServices.map((service, index) => (
                  <label key={index} className={`block border rounded-lg p-4 cursor-pointer transition-colors ${selectedShipping?.service === service.service ? "border-white bg-zinc-900" : "border-zinc-800 hover:border-zinc-700"}`}>
                    <input type="radio" name="shipping" checked={selectedShipping?.service === service.service} onChange={() => setSelectedShipping(service)} className="hidden" />
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">{service.name} - {service.service}</p>
                        <p className="text-zinc-400 text-sm">{service.description} {service.etd && `(${service.etd})`}</p>
                      </div>
                      <p className="text-white font-bold">Rp {service.cost.toLocaleString("id-ID")}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-600 italic">Layanan tidak tersedia atau alamat belum lengkap</p>
            )}
          </div>

          {/* Produk */}
          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Produk Pesanan</h2>
            <div className="space-y-4">
              {itemProducts?.map((item: any) => (
                <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4 pb-4 border-b border-zinc-800 last:border-0">
                  <Image src={`${BASE_IMAGE_URL}/${item.product.image}`} alt={item.product.name} width={400} height={400} unoptimized className="w-20 h-24 object-cover rounded" />
                  <div className="flex-grow">
                    <h3 className="text-white font-semibold mb-1">{item.product.name}</h3>
                    <p className="text-zinc-400 text-sm mb-1">Size: {item.size} {item.color && item.color !== "-" && ` | Color: ${item.color}`} | Qty: {item.qty}</p>
                    <p className="text-white">Rp {parseInt(item.product.price).toLocaleString("id-ID")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Ringkasan */}
        <div className="lg:col-span-1">
          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6 sticky top-24 space-y-6">
            <h2 className="text-xl font-bold text-white mb-6">Ringkasan Pembayaran</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Ongkos Kirim</span>
                <span>{selectedShipping ? `Rp ${selectedShipping.cost.toLocaleString("id-ID")}` : "-"}</span>
              </div>
              <div className="border-t border-zinc-800 pt-3 flex justify-between text-white">
                <span className="font-semibold">Total Pembayaran</span>
                <span className="font-bold text-xl text-blue-400">Rp {(totalPrice + (selectedShipping?.cost || 0)).toLocaleString("id-ID")}</span>
              </div>
            </div>

            <button onClick={handleCheckout} disabled={!selectedAddress || !selectedShipping || isSubmitting} className="w-full bg-white text-black py-3 rounded-lg hover:bg-zinc-200 transition-colors font-bold text-sm disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses Split Invoice...</> : "Lanjut ke Pembayaran"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}