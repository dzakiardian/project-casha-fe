"use client";

import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus, ShoppingBag, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { clientFetch } from "@/lib/apiFetch";
import Image from "next/image";
import { BASE_IMAGE_URL } from "../components/base-api";
import { toast } from "sonner";
import { generateRandomString, randomAngka, uniqueId } from "../components/random-num";

export default function Cart() {
  const router = useRouter();
  // const { items, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  const [cartsData, setCartsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadData, setReloadData] = useState("");

  const fetchCarts = async () => {
    try {
      const carts = await clientFetch("/carts");

      setCartsData(carts.data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      await clientFetch(`/carts/${id}`, {
        method: 'DELETE'
      });

      setReloadData(generateRandomString());
      toast.success("Berhasil dihapus.")
    } catch (error) {
      console.log(error);
      toast.error("Gagal menghapus, coba lagi nanti");
    }
  }

  const updateQuantity = async (id: string, qty: number) => {
    try {
      await clientFetch(`/update-cart-qty/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ qty: qty }),
      });

      setReloadData(generateRandomString());
      toast.success("Berhasil diupdate")
    } catch (error) {
      console.log(error);
      toast.error("Gagal diupdate");
    }
  }

  const totalPrice = cartsData?.reduce((accumulator, item) => {
    const subtotal = item.product.price * item.qty;

    return accumulator + subtotal;
  }, 0);

  useEffect(() => {
    fetchCarts();
  }, [reloadData]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Loader2 className="w-24 h-24 text-zinc-700 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Mengambil data keranjang
          </h2>
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
          <h2 className="text-2xl font-bold text-white mb-4">
            Keranjang Belanja Kosong
          </h2>
          <p className="text-zinc-400 mb-8">
            Belum ada produk di keranjang. Yuk mulai belanja!
          </p>
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
          {cartsData?.map((item) => (
            <div
              key={`${item?.product.id}-${item.size}-${item.color}`}
              className="bg-[#121212] border border-zinc-800 rounded-lg p-4"
            >
              <div className="flex gap-4">
                <Image
                  src={`${BASE_IMAGE_URL}/${item?.product.image}`}
                  alt={item?.product.name}
                  width={500}
                  height={500}
                  unoptimized
                  className="w-24 h-32 object-cover rounded-lg"
                />

                <div className="flex-grow">
                  <h3 className="text-white font-semibold mb-1">
                    {item.product.name}
                  </h3>
                  <p className="text-zinc-400 text-sm mb-1">
                    Ukuran: {item.size}
                  </p>
                  {item.color && item.color !== "-" && (
                    <p className="text-zinc-400 text-sm mb-2">
                      Warna: {item.color}
                    </p>
                  )}
                  <p className="text-white mb-3">
                    Rp {parseInt(item.product.price)?.toLocaleString("id-ID")}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.qty - 1,
                          )
                        }
                        className="w-8 h-8 rounded bg-zinc-800 text-white hover:bg-zinc-700 transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white w-8 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.qty + 1,
                          )
                        }
                        className="w-8 h-8 rounded bg-zinc-800 text-white hover:bg-zinc-700 transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        removeFromCart(item.id)
                      }
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6">
              Ringkasan Belanja
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>Rp {totalPrice?.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Biaya asuransi pengiriman</span>
                <span>Gratis</span>
              </div>
              <div className="border-t border-zinc-800 pt-3 flex justify-between text-white">
                <span className="font-semibold">Total</span>
                <span className="font-bold">
                  Rp {totalPrice?.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="w-full bg-white text-black py-3 rounded-lg hover:bg-zinc-200 transition-colors font-semibold"
            >
              Lanjut ke Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
