"use client";

import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ShoppingBag, Loader2, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { clientFetch } from "@/lib/apiFetch";
import Image from "next/image";
import { BASE_IMAGE_URL } from "../components/base-api";
import { toast } from "sonner";
import { generateRandomString } from "../components/random-num";

export default function Cart() {
  const router = useRouter();

  const [cartsData, setCartsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadData, setReloadData] = useState("");

  // ─── STATE BARU UNTUK MENAMPUNG ID ITEM YANG DICENTANG ───
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    document.title = "Mahen Store - Keranjang Saya";
  }, []);

  const fetchCarts = async () => {
    try {
      const carts = await clientFetch("/carts");
      setCartsData(carts.data);

      // Default: Otomatis centang semua item saat pertama kali keranjang dimuat
      if (carts.data && Array.isArray(carts.data)) {
        const allIds = carts.data.map((item: any) => item.id);
        setSelectedItems(allIds);
      }

      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      await clientFetch(`/carts/${id}`, {
        method: "DELETE",
      });

      // Bersihkan ID dari list selectedItems jika barangnya dihapus
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
      setReloadData(generateRandomString());
      toast.success("Berhasil dihapus.");
    } catch (error) {
      console.log(error);
      toast.error("Gagal menghapus, coba lagi nanti");
    }
  };

  const updateQuantity = async (id: string, qty: number) => {
    if(qty == 0) {
      toast.warning("Jumlah produk tidak boleh kurang dari 1 pcs");
      return;
    }

    try {
      await clientFetch(`/update-cart-qty/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ qty: qty }),
      });

      setReloadData(generateRandomString());
      toast.success("Berhasil diupdate");
    } catch (error) {
      console.log(error);
      toast.error("Gagal diupdate");
    }
  };

  // ─── HANDLER TOGGLE CHECKBOX INDIVIDU ───
  const handleToggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  // ─── HANDLER SELECT ALL / DESELECT ALL ───
  const handleSelectAll = () => {
    if (selectedItems.length === cartsData.length) {
      // Jika semua sudah dicentang, maka kosongkan centang (Deselect All)
      setSelectedItems([]);
    } else {
      // Jika belum semua, maka centang semua ID yang ada
      const allIds = cartsData.map((item: any) => item.id);
      setSelectedItems(allIds);
    }
  };

  // ─── HITUNG TOTAL HARGA HANYA UNTUK BARANG YANG DICENTANG ───
  const totalPrice = cartsData?.reduce((accumulator, item) => {
    if (selectedItems.includes(item.id)) {
      const subtotal = item.product.price * item.qty;
      return accumulator + subtotal;
    }
    return accumulator;
  }, 0);

  // Fungsi mengarahkan ke checkout dengan membawa ID barang terpilih
  const handleNavigateToCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Pilih minimal satu produk untuk melanjutkan checkout!");
      return;
    }
    // Kirim ID item terpilih sebagai query string, misal: /checkout?items=id1,id2
    const itemsQuery = selectedItems.join(",");
    router.push(`/checkout?items=${encodeURIComponent(itemsQuery)}`);
  };

  useEffect(() => {
    fetchCarts();
  }, [reloadData]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Loader2 className="w-24 h-24 text-zinc-700 mx-auto mb-6 animate-spin" />
          <h2 className="text-2xl font-bold text-white mb-4">Mengambil data keranjang</h2>
          <p className="text-zinc-400 mb-8">Tunggu sebentarr</p>
        </div>
      </div>
    );
  }

  if (cartsData?.length === 0 || cartsData == undefined) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="w-24 h-24 text-zinc-700 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Keranjang Belanja Kosong</h2>
          <p className="text-zinc-400 mb-8">Belum ada produk di keranjang. Yuk mulai belanja!</p>
          <button
            onClick={() => router.push("/products")}
            className="bg-white text-black px-8 py-3 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Belanja Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Keranjang Belanja</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">

          {/* ─── TOOLBAR MASTER CHECKBOX (SELECT ALL) ─── */}
          {/* ─── TOOLBAR MASTER CHECKBOX MAKEOVER ─── */}
          <div className="bg-[#121212] border border-zinc-800 rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={cartsData.length > 0 && selectedItems.length === cartsData.length}
                onChange={handleSelectAll}
                className="peer h-5 w-5 appearance-none rounded-md border border-zinc-700 bg-zinc-900/50 checked:bg-white checked:border-white transition-all duration-200 cursor-pointer focus:outline-none"
              />
              <Check className="absolute w-3.5 h-3.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none stroke-[3]" />
            </div>
            <button
              onClick={handleSelectAll}
              className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              Pilih Semua ({cartsData.length} Produk)
            </button>
            {selectedItems.length > 0 && (
              <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/40 border border-blue-900/40 px-2.5 py-0.5 rounded-lg ml-auto">
                {selectedItems.length} Terpilih
              </span>
            )}
          </div>

          {/* LIST BARANG KERANJANG */}
          {cartsData?.map((item) => {
            const isChecked = selectedItems.includes(item.id);
            return (
              <div
                key={`${item?.product.id}-${item.size}-${item.color}`}
                className={`border rounded-lg p-4 transition-all duration-200 ${isChecked ? "bg-[#161616] border-zinc-600" : "bg-[#121212] border-zinc-800"
                  }`}
              >
                <div className="flex gap-4 items-start">

                  {/* ─── CHECKBOX INDIVIDU PRODUK ─── */}
                  {/* ─── CHECKBOX INDIVIDU PRODUK MAKEOVER ─── */}
                  <div className="pt-11 pr-2">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(item.id)}
                        className="peer h-5 w-5 appearance-none rounded-full border border-zinc-800 bg-zinc-900/80 checked:bg-white checked:border-white transition-all duration-200 cursor-pointer focus:outline-none hover:border-zinc-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] checked:shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                      />
                      {/* Ikon Check Kecil Otomatis Muncul Putih Berlatar Hitam saat Aktif */}
                      <Check className="absolute w-3 h-3 text-black opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none stroke-[3.5]" />
                    </div>
                  </div>

                  <Image
                    src={`${BASE_IMAGE_URL}/${item?.product.image}`}
                    alt={item?.product.name}
                    width={500}
                    height={500}
                    unoptimized
                    className="w-24 h-32 object-cover rounded-lg border border-zinc-800/60"
                  />

                  <div className="flex-grow">
                    <h3 className="text-white font-semibold mb-1">{item.product.name}</h3>
                    <p className="text-zinc-400 text-sm mb-1">Ukuran: {item.size}</p>
                    {item.color && item.color !== "-" && (
                      <p className="text-zinc-400 text-sm mb-2">Warna: {item.color}</p>
                    )}
                    <p className="text-white mb-3 font-medium">
                      Rp {parseInt(item.product.price)?.toLocaleString("id-ID")}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.qty - 1)}
                          className={`w-8 h-8 rounded ${item.qty == 1 ? 'bg-slate-200/60' : 'bg-zinc-800'} text-white hover:bg-zinc-700 transition-colors flex items-center justify-center`}
                          // disabled={item.qty == 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-white w-8 text-center font-mono">{item.qty}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.qty + 1)}
                          className="w-8 h-8 rounded bg-zinc-800 text-white hover:bg-zinc-700 transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SIDEBAR SUMMARY BILLING */}
        <div className="lg:col-span-1">
          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6 sticky top-24 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">Ringkasan Belanja</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-zinc-400 text-sm">
                <span>Subtotal ({selectedItems.length} Barang)</span>
                <span className="font-mono text-white font-semibold">
                  Rp {totalPrice?.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400 text-sm">
                <span>Biaya asuransi pengiriman</span>
                <span className="text-emerald-400 font-semibold text-xs bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded">
                  Gratis
                </span>
              </div>
              <div className="border-t border-zinc-800 pt-3 flex justify-between text-white">
                <span className="font-semibold text-sm">Total Tagihan</span>
                <span className="font-bold text-lg text-blue-400 font-mono">
                  Rp {totalPrice?.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* ─── ACTION BUTTON CHECKOUT DENGAN VALIDASI CENTANG ─── */}
            <button
              onClick={handleNavigateToCheckout}
              disabled={selectedItems.length === 0}
              className="w-full bg-white text-black py-3 rounded-lg hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all font-bold text-sm shadow-md"
            >
              {selectedItems.length === 0 ? "Pilih Produk Dahulu" : `Bayar Sekarang (${selectedItems.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}