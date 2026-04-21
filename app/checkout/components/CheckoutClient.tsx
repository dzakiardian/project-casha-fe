"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { clientFetch } from "@/lib/apiFetch";
import Image from "next/image";
import { BASE_IMAGE_URL } from "@/app/components/base-api";
import Cookies from "js-cookie";

type Address = { id: string; label: string };
interface ShippingService {
  name: string;
  code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

export default function CheckoutClient(address, itemProducts) {
  const router = useRouter();

  const { user } = useAuth();
  const [items, setItems] = useState<any>([]);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const getTotalPrice = () => {
    return 324;
  };

  const totalPrice = address?.itemProducts.reduce((accumulator, item) => {
    const subtotal = item.product.price * item.qty;

    return accumulator + subtotal;
  }, 0);

  const fetchItems = async () => {
    try {
      const data = await clientFetch("/carts");
      setItems(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAddress = async () => {
    try {
      const data = await clientFetch("/address");
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (address?.address?.length) {
      const defaultAddress = address?.address.find((addr) => addr.isPrimary);
      setSelectedAddress(defaultAddress ?? address[0]);
    }

    fetchAddress();
    fetchItems();
  }, [address.address]);

  // State untuk cek ongkir
  const [selectedCourier, setSelectedCourier] = useState("");
  const [destinationCityId, setDestinationCityId] = useState("");
  const [shippingServices, setShippingServices] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [isLoadingOngkir, setIsLoadingOngkir] = useState(false);

  const getTotalWeight = () => {
    return 1000;
  };

  const handleCheckOngkir = async () => {
    setIsLoadingOngkir(true);
    try {
      const response = await fetch("/api/ongkir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: "69140",
          destination: selectedAddress?.originId || "34361",
          weight: "1000",
          courier: "jnt",
        }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const json = await response.json();
      const dataOngkir = json.data;

      if (dataOngkir.length === 0) {
        toast.error("Tidak ada layanan tersedia");
      } else {
        setShippingServices(dataOngkir);
        toast.success("Ongkir berhasil diupdate!");
      }
    } catch (error) {
      console.error("Client error:", error);
      toast.error("Gagal cek ongkir.");
    } finally {
      setIsLoadingOngkir(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      handleCheckOngkir();
    }, 3000);
  }, [selectedAddress]);

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error("Pilih alamat pengiriman terlebih dahulu");
      return;
    }
    if (!selectedShipping) {
      toast.error("Pilih layanan pengiriman terlebih dahulu");
      return;
    }
    if (!address?.itemProducts || address.itemProducts.length === 0) {
      toast.error("Keranjang kamu kosong, tidak bisa checkout");
      return;
    }

    // setIsLoading(true);

    try {
      // 1. Kumpulkan semua "janji" (promises) kirim data
      const orderPromises = address.itemProducts.map(async (item: any) => {
        // Hitung pembagian ongkir rata per item
        const costPerItem = Math.round(
          selectedShipping.cost / address.itemProducts.length,
        );

        const payloadOrder = {
          productId: item.product.id,
          qty: item.qty,
          shippingCost: selectedShipping.cost,
          insuranceCost: 0,
          notes: item.notes || "default notes",
          size: item.size || "XL",
          color: item.color || "Biru",
          weight: "1000",
        };

        await clientFetch(`/carts/${item.id}`, {
          method: "DELETE",
        });

        return clientFetch("/orders/checkout", {
          method: "POST",
          body: JSON.stringify(payloadOrder),
        });
      });

      await Promise.all(orderPromises);

      toast.success(
        "Semua pesanan berhasil dibuat! Silakan upload bukti pembayaran.",
      );

      const ordersRes = await clientFetch("/orders");
      const orders = ordersRes.data;

      const itemCount = address.itemProducts.length;
      const latestOrders = orders.slice(-itemCount);

      const cookiesPayload = latestOrders.map((order: any) => ({
        orderId: order.id,
        date: order.createdAt || new Date().toISOString(),
        origin: "Sumub Kidul, Kecamatan Kesesi, Kabupaten Pekalongan",
        selectedCourier: selectedShipping,
        totalPrice: totalPrice,
      }));

      Cookies.set("pendingOrder", JSON.stringify(cookiesPayload), {
        expires: 1,
      });

      router.push("/pembayaran");
      router.refresh();
    } catch (error) {
      console.error("Error saat checkout:", error);
      toast.error("Gagal membuat pesanan. Coba lagi ya Bang.");
    } finally {
      //   setIsLoading(false);
    }
  };

  //   if (address?.itemProducts.length === 0) {
  //     setTimeout(() => {
  //         router.push("/cart");
  //     }, 5000);
  //     return null;
  //   }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Alamat Pengiriman
            </h2>

            {address.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-400 mb-4">Belum ada alamat tersimpan</p>
                <button
                  onClick={() => router.push("/profile/address")}
                  className="bg-white text-black px-6 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Tambah Alamat
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {address?.address.map((address: any) => (
                  <label
                    key={address.id}
                    className={`block border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedAddress?.id === address.id
                        ? "border-white bg-zinc-900"
                        : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress?.id === address.id}
                      onChange={() => setSelectedAddress(address)}
                      className="hidden"
                    />
                    <div>
                      <p className="text-white font-semibold mb-1">
                        {address.label}
                        {address.isPrimary && (
                          <span className="ml-2 text-xs bg-zinc-700 px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-zinc-400 text-sm mb-1">
                        {address.fullName} | {address.phoneNumber}
                      </p>
                      <p className="text-zinc-400 text-sm">
                        {address.detail}, {address.city}, {address.postalCode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Cek Ongkir Section */}
          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Pilih Pengiriman
            </h2>

            <div className="space-y-4">
              {shippingServices.length > 0 && (
                <div className="mt-4 space-y-2">
                  <label className="block text-zinc-400 text-sm mb-2">
                    Pilih Layanan
                  </label>
                  {shippingServices.map((service, index) => (
                    <label
                      key={index}
                      className={`block border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedShipping?.service === service.service
                          ? "border-white bg-zinc-900"
                          : "border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        checked={selectedShipping?.service === service.service}
                        onChange={() => setSelectedShipping(service)}
                        className="hidden"
                      />
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white font-semibold">
                            {service.name} - {service.service}
                          </p>
                          <p className="text-zinc-400 text-sm">
                            {service.description}{" "}
                            {service.etd && `(${service.etd})`}
                          </p>
                        </div>
                        <p className="text-white font-bold">
                          Rp {service.cost.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Produk Pesanan
            </h2>
            <div className="space-y-4">
              {address?.itemProducts.map((item: any) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="flex gap-4 pb-4 border-b border-zinc-800 last:border-0"
                >
                  <Image
                    src={`${BASE_IMAGE_URL}/${item.product.image}`}
                    alt={item.product.name}
                    width={400}
                    height={400}
                    unoptimized
                    className="w-20 h-24 object-cover rounded"
                  />
                  <div className="flex-grow">
                    <h3 className="text-white font-semibold mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-zinc-400 text-sm mb-1">
                      Size: {item.size}
                      {item.color &&
                        item.color !== "-" &&
                        ` | Color: ${item.color}`}
                      {" | Qty: "}
                      {item.qty}
                    </p>
                    <p className="text-white">
                      Rp {parseInt(item.product.price).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6 sticky top-24 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-6">
                Ringkasan Pembayaran
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Ongkos Kirim</span>
                  <span>
                    {selectedShipping
                      ? `Rp ${selectedShipping.cost.toLocaleString("id-ID")}`
                      : "-"}
                  </span>
                </div>
                <div className="border-t border-zinc-800 pt-3 flex justify-between text-white">
                  <span className="font-semibold">Total Pembayaran</span>
                  <span className="font-bold text-xl">
                    Rp{" "}
                    {(
                      totalPrice + (selectedShipping?.cost || 0)
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={!selectedAddress || !selectedShipping}
                className="w-full bg-white text-black py-3 rounded-lg hover:bg-zinc-200 transition-colors font-semibold disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed"
              >
                Lanjut ke Pembayaran
              </button>

              <p className="text-zinc-500 text-xs text-center mt-4">
                Dengan melakukan pembayaran, Anda menyetujui syarat dan
                ketentuan kami
              </p>
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <h3 className="text-white font-semibold mb-3">
                Petunjuk Pembayaran
              </h3>
              <div className="space-y-3 text-sm text-zinc-400">
                <div>
                  <p className="font-semibold text-white mb-1">Transfer Bank</p>
                  <p>Bank BCA</p>
                  <p className="font-mono text-white">1234567890</p>
                  <p>a.n. Mahen Store</p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">
                    Langkah-langkah:
                  </p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Klik "Lanjut ke Pembayaran"</li>
                    <li>Transfer sesuai total pembayaran</li>
                    <li>Upload bukti transfer</li>
                    <li>Tunggu konfirmasi admin</li>
                  </ol>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded p-3 mt-3">
                  <p className="text-xs text-zinc-500">
                    ⚠️ Pesanan akan otomatis dibatalkan jika tidak ada
                    konfirmasi pembayaran dalam 24 jam
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
