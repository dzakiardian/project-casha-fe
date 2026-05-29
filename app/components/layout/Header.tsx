"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, Search, Menu, ChevronDown, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { clientFetch } from "@/lib/apiFetch";
import { useCart } from "@/app/context/CartContext";

interface DbCategory {
  id: string;
  name: string;
  tag: string;
}

export const Header: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { getTotalItems } = useCart();
  const liveCartCount = getTotalItems(); // Otomatis lari realtime pas klik tambah!

  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);
  // Kita kembalikan state khusus ini biar hitungannya 100% akurat dari database
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);
  // State tambahan di Header untuk memicu re-render paksa
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    // Fungsi pemicu re-render otomatis saat ada sinyal masuk
    const handleLiveUpdate = () => {
      setRefreshTick(prev => prev + 1); // Memaksa komponen Header menggambar ulang badge-nya
    };

    // Daftarkan sinyal bernama "cart-updated" ke dalam sistem browser
    window.addEventListener("live-cart-update", handleLiveUpdate);

    return () => {
      window.removeEventListener("live-cart-update", handleLiveUpdate);
    };
  }, []);

  const fetchDatabaseCategories = async () => {
    try {
      const res = await clientFetch("/categories");
      if (res?.data && Array.isArray(res.data)) {
        setDbCategories(res.data);
      }
    } catch (error) {
      console.error("Gagal memuat list kategori dinamis:", error);
    }
  };

  // Fungsi andalan buat hitung total item unik di keranjang backend
  const fetchCartItemsCount = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await clientFetch("/carts");
      if (res?.data && Array.isArray(res.data)) {
        setCartItemsCount(res.data.length);
      }
    } catch (error) {
      console.error("Gagal memuat jumlah item keranjang:", error);
    }
  };

  useEffect(() => {
    fetchDatabaseCategories();

    if (isAuthenticated) {
      fetchCartItemsCount();
    }

    // ─── TRIK SAKTI REALTIME: DAFTARKAN EVENT LISTENER CUSTOM ───
    const handleCartUpdateEvent = () => {
      fetchCartItemsCount(); // Jalankan ulang hitungan badge tiap kali ada trigger aksi
    };

    window.addEventListener("cart-updated", handleCartUpdateEvent);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdateEvent);
    };
  }, [isAuthenticated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCartItemsCount(0);
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Logo & Menu di Kiri */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-white whitespace-nowrap">
              Mahen Store
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/" className="text-zinc-300 hover:text-white transition-colors">
                Home
              </Link>

              {/* Dropdown Produk */}
              <div className="relative group">
                <button className="flex items-center gap-1 text-zinc-300 hover:text-white transition-colors">
                  Produk
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-[#1a1a1a] border border-zinc-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    href="/products"
                    className="block px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors rounded-t-lg border-b border-zinc-800/50 font-semibold"
                  >
                    Semua Produk
                  </Link>

                  {dbCategories.length === 0 ? (
                    <div className="px-4 py-2 text-xs text-zinc-600 italic">Kategori kosong</div>
                  ) : (
                    dbCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.name.toLowerCase()}`}
                        className="block px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors last:rounded-b-lg capitalize text-sm"
                      >
                        {cat.name}
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <Link href="/about" className="text-zinc-300 hover:text-white transition-colors">
                Tentang
              </Link>
              <Link href="/contact" className="text-zinc-300 hover:text-white transition-colors">
                Kontak
              </Link>
            </nav>
          </div>

          {/* Search Bar Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            </div>
          </form>

          {/* Icons Kanan */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-zinc-300 hover:text-white transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* ─── BADGE TOTAL PRODUK UNIK AKURAT DATABASE ─── */}
                <Link href="/cart" className="relative text-zinc-300 hover:text-white transition-colors p-1">
                  <ShoppingCart className="w-5 h-5" />
                  {liveCartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-bold font-mono rounded-full w-4 h-4 flex items-center justify-center border border-[#1a1a1a]">
                      {liveCartCount >= 120 ? "120" : liveCartCount}
                    </span>
                  )}
                </Link>

                {/* Dropdown Profile */}
                <div className="relative group">
                  <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all focus:outline-none">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-sm font-bold text-blue-400 group-hover:border-zinc-600 transition-colors">
                      {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                    </div>
                  </button>

                  <div className="absolute right-0 pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out z-50 transform translate-y-1 group-hover:translate-y-0">
                    <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
                      <div className="px-4 py-3.5 bg-[#161616] border-b border-zinc-800/80 flex flex-col gap-1">
                        <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Akun Login</p>
                        <p className="text-sm font-semibold text-white truncate max-w-full">{user?.fullName || "Nama Pengguna"}</p>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${user?.role === "admin" ? "bg-red-950/40 text-red-400 border-red-900/50" : "bg-blue-950/40 text-blue-400 border-blue-900/50"
                            }`}>{user?.role || "Customer"}</span>
                        </div>
                      </div>

                      <div className="p-1.5 space-y-0.5">
                        <Link href="/profile" className="flex items-center px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors rounded-lg">
                          Profile Saya
                        </Link>
                        {user?.role === "admin" && (
                          <Link href="/dashboard" className="flex items-center px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors rounded-lg">
                            Panel Admin Dashboard
                          </Link>
                        )}
                      </div>

                      <div className="p-1.5 border-t border-zinc-800/60 bg-[#151515]/50">
                        <button onClick={handleLogout} className="w-full flex items-center px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors rounded-lg">
                          Keluar (Logout)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 rounded-lg transition-all duration-200">
                  Masuk
                </Link>
                <Link href="/register" className="px-4 py-2 text-xs font-bold text-black bg-white hover:bg-zinc-200 rounded-lg transition-all duration-200 shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] whitespace-nowrap">
                  Daftar Akun
                </Link>
              </div>
            )}

            <button className="lg:hidden text-zinc-300 hover:text-white transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};