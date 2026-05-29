"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { clientFetch } from "@/lib/apiFetch";
import { useAuth } from "./AuthContext"; // Import auth buat mastiin fetch jalan pas login
import { toast } from "sonner";

// Cocokkan struktur item dengan tabel carts database backend abang
interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  size: string;
  color: string;
  // Jika backend mengembalikan relasi data produk di dalamnya
  product?: {
    id: string;
    name: string;
    image: string;
    base_price: string;
    discount_price: string;
    stock: number;
  };
}

interface CartContextType {
  items: CartItem[];
  isLoadingCart: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, size: string, color: string, quantity?: number) => Promise<void>;
  removeFromCart: (cartId: string) => Promise<void>;
  updateQuantity: (cartId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();

  // 1. Fungsi Sinkronisasi Data live dari tabel carts MySQL backend
  const fetchCart = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoadingCart(true);
      const res = await clientFetch("/carts");
      if (res?.data && Array.isArray(res.data)) {
        setItems(res.data);
      }
    } catch (error) {
      console.error("Gagal sinkronisasi data keranjang database:", error);
    } finally {
      setIsLoadingCart(false);
    }
  };

  // Trigger fetch data setiap kali user berhasil login masuk aplikasi
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setItems([]); // Bersihkan state jika logout
    }
  }, [isAuthenticated]);

  // 2. Fungsi Tambah Keranjang via API
  const addToCart = async (productId: string, size: string, color: string, qty: number = 1) => {
    // Kunci Validasi: Cek apakah jenis produk unik sudah mentok 120 item sebelum kirim POST
    if (items.length >= 120) {
      toast.error("Keranjang penuh! Maksimal hanya boleh menampung 120 jenis produk.");
      return;
    }

    try {
      await clientFetch("/carts", {
        method: "POST",
        body: JSON.stringify({ productId, size, color, qty }),
      });
      
      toast.success("Produk dimasukkan ke keranjang!");
      await fetchCart(); // ─── KUNCI REALTIME: Tarik ulang data MySQL biar Header langsung berubah! ───
    } catch (error) {
      toast.error("Gagal menambahkan produk ke keranjang");
    }
  };

  // 3. Fungsi Hapus Item Keranjang via API
  const removeFromCart = async (cartId: string) => {
    try {
      await clientFetch(`/carts/${cartId}`, { method: "DELETE" });
      toast.success("Item berhasil dihapus dari keranjang");
      await fetchCart(); // Refresh data live
    } catch (error) {
      toast.error("Gagal menghapus item");
    }
  };

  // 4. Fungsi Update Qty Item via API
  const updateQuantity = async (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartId);
      return;
    }
    try {
      await clientFetch(`/carts/${cartId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
      await fetchCart(); // Refresh data live
    } catch (error) {
      console.error("Gagal update quantity:", error);
    }
  };

  // 5. Fungsi Clear Semua isi Keranjang via API
  const clearCart = async () => {
    try {
      await clientFetch("/carts/clear", { method: "DELETE" });
      setItems([]);
    } catch (error) {
      console.error("Gagal mengosongkan keranjang:", error);
    }
  };

  // 6. Fungsi Hitung Jumlah Jenis Produk Unik untuk Badge di Header
  const getTotalItems = () => {
    // Sesuai request abang: yang dihitung adalah baris item uniknya, bukan jumlah total qty
    return items ? items.length : 0;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isLoadingCart,
        fetchCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};