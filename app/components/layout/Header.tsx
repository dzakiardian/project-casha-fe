import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, Search, Menu, ChevronDown, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export const Header: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { getTotalItems } = useCart();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // console.log(user[0].username);
  const categories = [
    { label: "Semua Produk", value: "all" },
    { label: "Kemeja", value: "kemeja" },
    { label: "Celana", value: "celana" },
    { label: "Jaket", value: "jaket" },
    { label: "Kaos", value: "kaos" },
    { label: "Sweater", value: "sweater" },
  ];

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
    router.push("/login");
    router.refresh(); // penting! biar server component ikut update
  };

  return (
    <header className="sticky top-0 z-50 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Logo & Menu di Kiri */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-2xl font-bold text-white whitespace-nowrap"
            >
              Mahen Store
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              <Link
                href="/"
                className="text-zinc-300 hover:text-white transition-colors"
              >
                Home
              </Link>

              {/* Dropdown Produk */}
              <div className="relative group">
                <button className="flex items-center gap-1 text-zinc-300 hover:text-white transition-colors">
                  Produk
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-[#1a1a1a] border border-zinc-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {categories.map((category) => (
                    <Link
                      key={category.value}
                      href={
                        category.value === "all"
                          ? "/products"
                          : `/products?category=${category.value}`
                      }
                      className="block px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/about"
                className="text-zinc-300 hover:text-white transition-colors"
              >
                Tentang
              </Link>
              <Link
                href="/contact"
                className="text-zinc-300 hover:text-white transition-colors"
              >
                Kontak
              </Link>
            </nav>
          </div>

          {/* Search Bar di Tengah (Desktop) */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex flex-1 max-w-md"
          >
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

          {/* Icons di Kanan */}
          <div className="flex items-center gap-4">
            {/* Search Icon Mobile */}
            <button
              className="lg:hidden text-zinc-300 hover:text-white transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>

            <Link
              href="/cart"
              className="relative text-zinc-300 hover:text-white transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative group">
                <button className="text-zinc-300 hover:text-white transition-colors">
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-zinc-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors rounded-t-lg"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors rounded-b-lg"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-zinc-300 hover:text-white transition-colors"
              >
                <User className="w-5 h-5" />
              </Link>
            )}

            <button
              className="lg:hidden text-zinc-300 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar Mobile */}
        {isSearchOpen && (
          <div className="lg:hidden py-4 border-t border-zinc-800">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              </div>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-zinc-800">
            <Link
              href="/"
              className="block py-2 text-zinc-300 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            <div className="py-2">
              <p className="text-zinc-500 text-sm mb-2">Produk</p>
              <div className="pl-4 space-y-2">
                {categories.map((category) => (
                  <Link
                    key={category.value}
                    href={
                      category.value === "all"
                        ? "/products"
                        : `/products?category=${category.value}`
                    }
                    className="block py-1 text-zinc-300 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/about"
              className="block py-2 text-zinc-300 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Tentang
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-zinc-300 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Kontak
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};
