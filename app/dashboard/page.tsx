"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  FolderOpen,
  ShoppingCart,
  Receipt,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Search,
  Upload,
  Image as ImageIcon,
  Check,
  Ban,
  Eye,
  TrendingUp,
  Calendar,
  BarChart3,
  Menu,
  Store,
  Users,
  DollarSign,
  ShieldAlert,
  UserCheck,
  Copy,
  AlertCircle,
  UserCog,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { clientFetch } from "@/lib/apiFetch";
import Image from "next/image";
import { BASE_IMAGE_URL } from "../components/base-api";
import { urlToFile } from "@/lib/url-to-file";
import { useAuth } from "../context/AuthContext";

// ─── INTERFACES & TYPES ───
interface Product {
  id: string;
  name: string;
  code: string;
  image: string;
  images: string[];
  description: string;
  base_price: string;
  discount_price: string;
  stock: number;
  size: string[];
  color: string[];
  weight: string[];
  category: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  tag: string;
}

interface Order {
  id: string;
  orderCode: string;
  totalAmount: string;
  shippingCost: string;
  insuranceCost: string;
  status: string;
  createdAt: string;
  size: string;
  color: string;
  weight: string;
  product: { name: string; image: string };
  notes: string;
}

interface PaymentProof {
  paymentId: string;
  orderCode: string;
  photoUrl: string;
  uploadedAt: string;
  user: { name: string; email: string };
  orderDetail: {
    orderId: string;
    productId: string;
    totalAmount: string;
    status: "waiting_verification" | "verified" | "rejected";
  };
}

interface AprioriRule {
  if_buy: string;
  then_buy: string;
  support: number;
  confidence: number;
  productA: string;
  productB: string;
}

interface AprioriAnalysis {
  period: {
    start: string;
    end: string;
  };
  total_transactions: number;
  rules: AprioriRule[];
}

interface AprioriParams {
  startDate: string;
  endDate: string;
  minSupport: number;
  minConfidence: number;
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

interface MonthlyData {
  month: string;
  total: number;
}

interface SalesOverview {
  todaySales: number;
  oneMonthSales: number;
  threeMonthSales: number;
  monthlySales: MonthlyData[];
}

type TabId = "overview" | "products" | "categories" | "orders" | "payments" | "users" | "analytics";

// ─── MAIN ADMIN PANEL COMPONENT ───
export default function AdminPage() {
  
  const { isAuthenticated, logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [salesOverview, setSalesOverview] = useState<SalesOverview>({
    todaySales: 0,
    oneMonthSales: 0,
    threeMonthSales: 0,
    monthlySales: [],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Alasan Pembatalan states
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedOrderIdToCancel, setSelectedOrderIdToCancel] = useState<string | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState("");

  // Apriori Analytics states
  const [aprioriAnalysis, setAprioriAnalysis] = useState<AprioriAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isSyncingRecommendation, setIsSyncingRecommendation] = useState(false);
  const [aprioriParams, setAprioriParams] = useState<AprioriParams>({
    startDate: "2026-01-01",
    endDate: "2026-05-01",
    minSupport: 0.1,
    minConfidence: 0.5,
  });

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPaymentDetailModalOpen, setIsPaymentDetailModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentProof | null>(null);

  const menuTabs: { id: TabId; label: string; icon: React.ComponentType<any> }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "products", label: "Produk", icon: Package },
    { id: "categories", label: "Kategori", icon: FolderOpen },
    { id: "orders", label: "Pesanan", icon: ShoppingCart },
    { id: "payments", label: "Bukti Pembayaran", icon: Receipt },
    { id: "users", label: "Manage User", icon: UserCog },
    { id: "analytics", label: "Analitik Apriori", icon: TrendingUp },
  ];

  if(!isAuthenticated) {
    document.location.href = '/';
  }

  if(user?.role != "admin") {
    document.location.href = '/';
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [productsRes, categoriesRes, ordersRes, paymentsRes, usersRes] =
        await Promise.all([
          clientFetch("/products"),
          clientFetch("/categories"),
          clientFetch("/orders/all"),
          clientFetch("/payments/recent"),
          clientFetch("/users"),
        ]);
        
      if (productsRes?.data) setProducts(productsRes.data);
      if (categoriesRes?.data) setCategories(categoriesRes.data);
      if (ordersRes?.data) setOrders(ordersRes.data);
      if (paymentsRes?.data) setPaymentProofs(paymentsRes.data);
      if (usersRes?.data) setUsers(usersRes.data);
      
      // ─── LOGIC AKUMULASI DATA PENJUALAN DARI ENDPOINT ORDERS ───
      if (ordersRes?.data && Array.isArray(ordersRes.data)) {
        const orderList: Order[] = ordersRes.data;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(now.getDate() - 90);

        let todaySum = 0;
        let oneMonthSum = 0;
        let threeMonthSum = 0;

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        const monthlyMap: Record<string, number> = {};
        
        for (let i = 4; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const label = `${monthNames[d.getMonth()]}`;
          monthlyMap[label] = 0;
        }

        orderList.forEach((order) => {
          if (order.status !== "pending" && order.status !== "cancelled") {
            const orderAmount = parseFloat(order.totalAmount) || 0;
            const orderDate = new Date(order.createdAt);

            if (orderDate >= startOfToday) todaySum += orderAmount;
            if (orderDate >= thirtyDaysAgo) oneMonthSum += orderAmount;
            if (orderDate >= ninetyDaysAgo) threeMonthSum += orderAmount;

            const monthLabel = monthNames[orderDate.getMonth()];
            if (monthlyMap[monthLabel] !== undefined) {
              monthlyMap[monthLabel] += orderAmount;
            }
          }
        });

        const formattedChartData = Object.keys(monthlyMap).map((key) => ({
          month: key,
          total: monthlyMap[key],
        }));

        setSalesOverview({
          todaySales: todaySum,
          oneMonthSales: oneMonthSum,
          threeMonthSales: threeMonthSum,
          monthlySales: formattedChartData,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal melakukan kalkulasi ringkasan data finansial");
    } finally {
      setIsLoading(false);
    }
  };

  // Product handlers
  const handleSaveProduct = async (product: Product) => {
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("code", product.code);
    formData.append("description", product.description);
    formData.append("base_price", product.base_price);
    formData.append("discount_price", product.discount_price);
    formData.append("stock", product.stock.toString());
    formData.append("category_id", product.category.id);

    if (product.image && product.image.startsWith("data:image")) {
      const mainImageFile = await urlToFile(product.image, "main-image.png", "image/png");
      formData.append("image", mainImageFile);
    } else {
      formData.append("image", product.image);
    }

    if (Array.isArray(product.images)) {
      let counter = 0;
      for (const imgData of product.images) {
        if (typeof imgData === "string" && imgData.startsWith("data:image")) {
          const fileBinary = await urlToFile(imgData, `additional-image-${counter}.png`, "image/png");
          formData.append("images", fileBinary);
        } else {
          formData.append("images", imgData);
        }
        counter++;
      }
    }

    formData.append("size", product.size.join(","));
    formData.append("color", product.color.join(","));
    formData.append("weight", product.weight.join(","));

    try {
      if (editingProduct) {
        await clientFetch(`/products/${product.id}`, { method: "PATCH", body: formData });
        setProducts(products.map((p) => (p.id === product.id ? product : p)));
        toast.success("Produk berhasil diupdate!");
      } else {
        await clientFetch("/products", { method: "POST", body: formData });
        toast.success("Produk berhasil ditambahkan!");
        fetchAll();
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast.error("Gagal menyimpan produk");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    try {
      await clientFetch(`/products/${id}`, { method: "DELETE" });
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Produk berhasil dihapus!");
    } catch (error) {
      toast.error("Gagal menghapus produk");
    }
  };

  // Category handlers
  const handleSaveCategory = async (category: Category) => {
    const formData = new FormData();
    formData.append("name", category.name);
    if (category.image && category.image.startsWith("data:image")) {
      const mainImageFile = await urlToFile(category.image, "main-image.png", "image/png");
      formData.append("image", mainImageFile);
    } else {
      formData.append("image", category.image);
    }
    formData.append("description", category.description);
    formData.append("tag", category.tag);

    try {
      if (editingCategory) {
        await clientFetch(`/categories/${category.id}`, { method: "PATCH", body: formData });
        setCategories(categories.map((c) => (c.id === category.id ? category : c)));
        toast.success("Kategori berhasil diupdate!");
      } else {
        const res = await clientFetch("/categories", { method: "POST", body: formData });
        setCategories([...categories, res.data || { ...category, id: crypto.randomUUID() }]);
        toast.success("Kategori berhasil ditambahkan!");
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      toast.error("Gagal menyimpan kategori");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;
    try {
      await clientFetch(`/categories/${id}`, { method: "DELETE" });
      setCategories(categories.filter((c) => c.id !== id));
      toast.success("Kategori berhasil dihapus!");
    } catch (error) {
      toast.error("Gagal menghapus kategori");
    }
  };

  // Order handlers
  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      await clientFetch(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
      toast.success("Status order berhasil diupdate!");
      fetchAll();
    } catch (error) {
      toast.error("Gagal mengupdate status");
    }
  };

  const handleConfirmCancelOrder = async () => {
    if (!selectedOrderIdToCancel || !cancelReasonInput.trim()) {
      toast.error("Alasan pembatalan wajib diisi!");
      return;
    }
    try {
      await clientFetch(`/orders/${selectedOrderIdToCancel}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelled", notes: `cancelled by admin : ${cancelReasonInput}` }),
      });
      setOrders(orders.map((o) => (o.id === selectedOrderIdToCancel ? { ...o, status: "cancelled" } : o)));
      toast.success("Pesanan berhasil dibatalkan beserta alasannya!");
      setIsCancelModalOpen(false);
      setSelectedOrderIdToCancel(null);
      setCancelReasonInput("");
      fetchAll();
    } catch (error) {
      toast.error("Gagal membatalkan pesanan");
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus order ini?")) return;
    try {
      await clientFetch(`/orders/${id}`, { method: "DELETE" });
      setOrders(orders.filter((o) => o.id !== id));
      toast.success("Order berhasil dihapus!");
      fetchAll();
    } catch (error) {
      toast.error("Gagal menghapus order");
    }
  };

  // Payment handlers
  const handleVerifyPayment = async (paymentId: string) => {
    try {
      await clientFetch(`/payments/${paymentId}/verify`, { method: "PATCH" });
      setPaymentProofs(
        paymentProofs.map((p) =>
          p.paymentId === paymentId ? { ...p, orderDetail: { ...p.orderDetail, status: "verified" } } : p
        )
      );
      toast.success("Bukti pembayaran berhasil diverifikasi!");
      setIsPaymentDetailModalOpen(false);
      fetchAll();
    } catch (error) {
      toast.error("Gagal verifikasi pembayaran");
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    try {
      await clientFetch(`/payments/${paymentId}/reject`, { method: "PATCH" });
      setPaymentProofs(
        paymentProofs.map((p) =>
          p.paymentId === paymentId ? { ...p, orderDetail: { ...p.orderDetail, status: "rejected" } } : p
        )
      );
      toast.success("Bukti pembayaran ditolak!");
      setIsPaymentDetailModalOpen(false);
      fetchAll();
    } catch (error) {
      toast.error("Gagal menolak pembayaran");
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus bukti pembayaran ini?")) return;
    try {
      await clientFetch(`/payments/${paymentId}`, { method: "DELETE" });
      setPaymentProofs(paymentProofs.filter((p) => p.paymentId !== paymentId));
      toast.success("Bukti pembayaran berhasil dihapus!");
    } catch (error) {
      toast.error("Gagal menghapus bukti pembayaran");
    }
  };

  // ─── USER MANAGEMENTS HANDLERS ───
  const handleUpdateUserRole = async (userId: string, newRole: "user" | "admin") => {
    try {
      await clientFetch(`/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      toast.success("Hak akses role user berhasil diubah!");
    } catch (error) {
      toast.error("Gagal mengubah hak akses role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data pengguna ini secara permanen?")) return;
    try {
      await clientFetch(`/users/${userId}`, { method: "DELETE" });
      setUsers(users.filter((u) => u.id !== userId));
      toast.success("Akun user berhasil dihapus dari database!");
    } catch (error) {
      toast.error("Gagal menghapus data akun user");
    }
  };

  // Apriori Analytics handler
  const handleRunAprioriAnalysis = async () => {
    setIsLoadingAnalysis(true);
    const queryParams = new URLSearchParams({
      startDate: aprioriParams.startDate,
      endDate: aprioriParams.endDate,
      minSupport: aprioriParams.minSupport.toString(),
      minConfidence: aprioriParams.minConfidence.toString(),
    });

    try {
      const res = await clientFetch(`/analyze?${queryParams.toString()}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAprioriAnalysis(res.data);
      setIsLoadingAnalysis(false);
      toast.success("Analisis berhasil dilakukan!");
    } catch (error) {
      console.log(error);
      toast.error("Analisis gagal dilakukan!");
      setIsLoadingAnalysis(false);
    }
  };

  const handleSyncRecommendation = async () => {
    setIsSyncingRecommendation(true);
    const requestBody = {
      minSupport: aprioriParams.minSupport,
      minConfidience: aprioriParams.minConfidence,
      startDate: aprioriParams.startDate,
      endDate: aprioriParams.endDate,
    };

    try {
      await clientFetch("/sync", {
        method: "POST",
        body: JSON.stringify(requestBody, null, 2),
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSyncingRecommendation(false);
      toast.success("Hasil apriori berhasil disync ke tabel rekomendasi!");
    } catch (error) {
      console.log(error);
      toast.error("Hasil apriori gagal disync ke tabel rekomendasi");
      setIsSyncingRecommendation(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      p?.code?.toLowerCase().includes(searchQuery?.toLowerCase())
  );
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery?.toLowerCase())
  );
  const filteredPaymentProofs = paymentProofs.filter(
    (p) =>
      p.orderCode.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      p.user.name.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      p.user.email.toLowerCase().includes(searchQuery?.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#141414] text-white flex">
      {/* ─── SIDEBAR NAVIGATION ─── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1a1a1a] border-r border-zinc-800 transition-transform duration-300 md:translate-x-0 md:static md:h-screen flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-zinc-800 gap-2.5">
          <Store className="w-6 h-6 text-blue-500" />
          <div>
            <span className="font-bold text-lg tracking-wide block text-white">Mahen Store</span>
            <span className="text-xs text-zinc-500 font-medium block -mt-1">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery("");
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                  isActive
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-400" : "text-zinc-400"}`} />
                {tab.label}
              </button>
            );
          })}
          <button
                onClick={() => {
                  const isTrue = confirm("Anda yakin ingin keluar?\nAnda harus login untuk dapat mengakses Dashboard Admin");

                  isTrue ? logout() : toast.info("Login dibatalkan");
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50`}
              >
                <ArrowLeft className={`w-5 h-5 text-zinc-400}`} />
                Logout
              </button>
        </nav>

        <div className="p-4 border-t border-zinc-800 bg-[#161616]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-blue-400">
              AD
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-300">{user?.fullName}</p>
              <p className="text-[10px] text-zinc-500">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── KONTEN UTAMA ─── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#121212]">
        <header className="h-16 bg-[#1a1a1a] border-b border-zinc-800 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold py-5 tracking-tight text-white capitalize">
              Manajemen {activeTab === "analytics" ? "Analitik" : activeTab === "users" ? "Pengguna" : activeTab}
            </h2>
          </div>
          <div className="text-xs text-zinc-500 font-mono hidden sm:block">
            Admin Dashboard v-1.0.0
          </div>
        </header>

        <main className="p-6 md:p-8 flex-1">
          {/* Subheader Toolbar global (Hanya untuk produk, kategori, pembayaran) */}
          {activeTab !== "analytics" && activeTab !== "overview" && activeTab !== "orders" && activeTab !== "users" && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 bg-[#1a1a1a] p-4 rounded-xl border border-zinc-800">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Cari data ${activeTab === "products" ? "produk" : "kategori"}...`}
                  className="w-full bg-[#121212] border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              </div>

              <button
                onClick={() => {
                  if (activeTab === "products") {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  } else if (activeTab === "categories") {
                    setEditingCategory(null);
                    setIsCategoryModalOpen(true);
                  }
                }}
                className="bg-white text-black px-4 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 text-sm font-semibold whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Tambah {activeTab === "products" ? "Produk" : "Kategori"}
              </button>
            </div>
          )}

          {/* Wrapper Konten Dinamis */}
          <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
            {isLoading ? (
              <div className="text-center py-24 text-zinc-500 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Sinkronisasi Basis Data...</span>
              </div>
            ) : (
              <>
                {activeTab === "overview" && (
                  <OverviewDashboard sales={salesOverview} users={users} />
                )}
                {activeTab === "products" && (
                  <ProductsTable
                    products={filteredProducts}
                    categories={categories}
                    onEdit={(p) => {
                      setEditingProduct(p);
                      setIsProductModalOpen(true);
                    }}
                    onDelete={handleDeleteProduct}
                  />
                )}
                {activeTab === "categories" && (
                  <CategoriesTable
                    categories={filteredCategories}
                    onEdit={(c) => {
                      setEditingCategory(c);
                      setIsCategoryModalOpen(true);
                    }}
                    onDelete={handleDeleteCategory}
                  />
                )}
                {activeTab === "orders" && (
                  <OrdersTabsContainer
                    orders={orders}
                    onUpdateStatus={handleUpdateOrderStatus}
                    onDelete={handleDeleteOrder}
                    setSelectedOrderIdToCancel={setSelectedOrderIdToCancel}
                    setIsCancelModalOpen={setIsCancelModalOpen}
                  />
                )}
                {activeTab === "payments" && (
                  <PaymentProofTable
                    paymentProofs={filteredPaymentProofs}
                    onView={(p) => {
                      setSelectedPayment(p);
                      setIsPaymentDetailModalOpen(true);
                    }}
                    onDelete={handleDeletePayment}
                  />
                )}
                {activeTab === "users" && (
                  <ManageUsersPanel
                    users={users}
                    onUpdateRole={handleUpdateUserRole}
                    onDeleteUser={handleDeleteUser}
                  />
                )}
                {activeTab === "analytics" && (
                  <AprioriAnalytics
                    params={aprioriParams}
                    setParams={setAprioriParams}
                    analysis={aprioriAnalysis}
                    isLoading={isLoadingAnalysis}
                    isSyncing={isSyncingRecommendation}
                    onRunAnalysis={handleRunAprioriAnalysis}
                    onSyncRecommendation={handleSyncRecommendation}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* ─── MODALS AREA ─── */}
      {isCancelModalOpen && (
        <CancelOrderModal
          isOpen={isCancelModalOpen}
          onClose={() => {
            setIsCancelModalOpen(false);
            setSelectedOrderIdToCancel(null);
            setCancelReasonInput("");
          }}
          reason={cancelReasonInput}
          setReason={setCancelReasonInput}
          onConfirm={handleConfirmCancelOrder}
        />
      )}

      {isPaymentDetailModalOpen && selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={() => {
            setIsPaymentDetailModalOpen(false);
            setSelectedPayment(null);
          }}
          onVerify={handleVerifyPayment}
          onReject={handleRejectPayment}
        />
      )}

      {isProductModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
          }}
          onSave={handleSaveCategory}
        />
      )}
    </div>
  );
}

// ─── SUB COMPONENTS ───

const OverviewDashboard: React.FC<{
  sales: SalesOverview;
  users: UserData[];
}> = ({ sales, users }) => {
  const [userSearch, setUserSearch] = useState("");
  
  const totalUsers = users.length;
  const totalAdmin = users.filter((u) => u.role === "admin").length;
  const totalRegularUser = users.filter((u) => u.role === "user").length;

  const maxSales = Math.max(...sales.monthlySales.map((d) => d.total), 1);
  const chartHeight = 160;

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8">
      {/* Sales Matrix Cards */}
      <div>
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
          Ringkasan Finansial Penjualan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#121212] rounded-xl p-5 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-zinc-500 text-xs font-semibold block mb-1">Penjualan Hari Ini</span>
              <span className="text-2xl font-bold text-white tracking-tight">
                Rp {sales.todaySales.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-950/40 border border-emerald-900 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#121212] rounded-xl p-5 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-zinc-500 text-xs font-semibold block mb-1">Penjualan 1 Bulan terakhir</span>
              <span className="text-2xl font-bold text-blue-400 tracking-tight">
                Rp {sales.oneMonthSales.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-950/40 border border-blue-900 flex items-center justify-center text-blue-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#121212] rounded-xl p-5 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-zinc-500 text-xs font-semibold block mb-1">Penjualan 3 Bulan terakhir</span>
              <span className="text-2xl font-bold text-purple-400 tracking-tight">
                Rp {sales.threeMonthSales.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-950/40 border border-purple-900 flex items-center justify-center text-purple-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Omset Chart Dashboard */}
      <div className="bg-[#121212] rounded-xl p-6 border border-zinc-800 shadow-md">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Grafik Tren Omset Penjualan Berjalan</h3>
            <p className="text-zinc-500 text-xs mt-0.5">Visualisasi realtime dihitung otomatis dari riwayat nota sukses</p>
          </div>
        </div>

        <div className="pt-4 px-2">
          <div className="relative flex items-end justify-between h-40 border-b border-zinc-800 w-full gap-4 sm:gap-8">
            {sales.monthlySales.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs">
                Belum ada rekaman omset bulan ini
              </div>
            ) : (
              sales.monthlySales.map((data, index) => {
                const percentageHeight = (data.total / maxSales) * chartHeight;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 bg-zinc-900 text-white text-[10px] font-mono py-1.5 px-2.5 rounded-md border border-zinc-700 pointer-events-none transition-all duration-200 shadow-xl z-10 text-center whitespace-nowrap transform translate-y-1 group-hover:translate-y-0">
                      <span className="text-zinc-400 block font-sans">Total Omset:</span>
                      Rp {data.total.toLocaleString("id-ID")}
                    </div>
                    <div
                      className="w-full sm:w-12 bg-gradient-to-t from-blue-600/30 to-blue-500 rounded-t-md transition-all duration-500 hover:to-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                      style={{ height: `${percentageHeight}px` }}
                    />
                  </div>
                );
              })
            )}
          </div>
          <div className="flex justify-between w-full pt-3 gap-4 sm:gap-8">
            {sales.monthlySales.map((data, index) => (
              <span key={index} className="flex-1 text-center text-xs text-zinc-500 font-semibold tracking-wide">
                {data.month}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* User Stats Cards */}
      <div>
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
          Statistik Keanggotaan Pengguna
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-[#121212] rounded-xl p-4 border border-zinc-800/80 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-zinc-800 text-zinc-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-zinc-500 text-xs font-medium">Total Terdaftar</p>
              <p className="text-white text-xl font-bold">{totalUsers} <span className="text-xs font-normal text-zinc-500">akun</span></p>
            </div>
          </div>

          <div className="bg-[#121212] rounded-xl p-4 border border-zinc-800/80 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-950/50 border border-blue-900/50 text-blue-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-zinc-500 text-xs font-medium">Role Customer</p>
              <p className="text-white text-xl font-bold">{totalRegularUser} <span className="text-xs font-normal text-zinc-500">User</span></p>
            </div>
          </div>

          <div className="bg-[#121212] rounded-xl p-4 border border-zinc-800/80 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-900/50 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-zinc-500 text-xs font-medium">Role Administrator</p>
              <p className="text-white text-xl font-bold">{totalAdmin} <span className="text-xs font-normal text-zinc-500">Admin</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Database List Table Preview */}
      <div className="bg-[#121212] rounded-xl border border-zinc-800 overflow-hidden shadow-md">
        <div className="px-6 py-4 border-b border-zinc-800 bg-[#161616] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-sm font-bold text-white">Database Akun E-Commerce</h3>
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Cari akun pengguna..."
              className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#181818] border-b border-zinc-800">
              <tr>
                {["Nama Lengkap", "Alamat Email", "Hak Akses (Role)", "Tanggal Registrasi"].map((h) => (
                  <th key={h} className="text-left px-6 py-3.5 text-zinc-400 font-semibold text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-zinc-500 text-sm">Tidak ada data pengguna ditemukan</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">{user.fullName}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400 break-all">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                        user.role === "admin" ? "bg-red-950/60 text-red-400 border border-red-900/50" : "bg-blue-950/60 text-blue-400 border border-blue-900/50"
                      }`}>{user.role}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 font-medium">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProductsTable: React.FC<{
  products: Product[];
  categories: Category[];
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
}> = ({ products, onEdit, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-[#1e1e1e] border-b border-zinc-800">
        <tr>
          {["Gambar", "Nama", "Kode", "Kategori", "Harga", "Stok", "Aksi"].map(
            (h) => (
              <th key={h} className="text-left px-6 py-4 text-zinc-400 font-semibold text-xs uppercase tracking-wider">{h}</th>
            )
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-800">
        {products.length === 0 ? (
          <tr>
            <td colSpan={7} className="text-center py-16 text-zinc-500 text-sm">Tidak ada produk ditemukan</td>
          </tr>
        ) : (
          products.map((product) => (
            <tr key={product.id} className="hover:bg-zinc-900/30 transition-colors">
              <td className="px-6 py-4">
                <Image
                  src={product.image.startsWith("data:image") ? product.image : `${BASE_IMAGE_URL}/${product.image}`}
                  alt={product.name}
                  width={400}
                  height={400}
                  unoptimized
                  className="w-12 h-16 object-cover rounded bg-zinc-900 border border-zinc-800"
                />
              </td>
              <td className="px-6 py-4 text-sm font-medium text-white">{product.name}</td>
              <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{product.code}</td>
              <td className="px-6 py-4 text-sm text-zinc-400">{product.category?.name || "-"}</td>
              <td className="px-6 py-4 text-sm">
                <div className="text-white font-medium">Rp {parseFloat(product.discount_price).toLocaleString("id-ID")}</div>
                {product.discount_price !== product.base_price && (
                  <div className="text-zinc-500 text-xs line-through">Rp {parseFloat(product.base_price).toLocaleString("id-ID")}</div>
                )}
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  product.stock > 10 ? "bg-green-950/50 text-green-400 border border-green-900" : product.stock > 0 ? "bg-yellow-950/50 text-yellow-400 border border-yellow-900" : "bg-red-950/50 text-red-400 border border-red-900"
                }`}>{product.stock} pcs</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                  <button onClick={() => onEdit(product)} className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-blue-400">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(product.id)} className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const CategoriesTable: React.FC<{
  categories: Category[];
  onEdit: (c: Category) => void;
  onDelete: (id: string) => void;
}> = ({ categories, onEdit, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-[#1e1e1e] border-b border-zinc-800">
        <tr>
          {["Gambar", "Nama", "Deskripsi", "Tag", "Aksi"].map((h) => (
            <th key={h} className="text-left px-6 py-4 text-zinc-400 font-semibold text-xs uppercase tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-800">
        {categories.length === 0 ? (
          <tr>
            <td colSpan={5} className="text-center py-16 text-zinc-500 text-sm">Tidak ada kategori ditemukan</td>
          </tr>
        ) : (
          categories.map((category) => (
            <tr key={category.id} className="hover:bg-zinc-900/30 transition-colors">
              <td className="px-6 py-4">
                <Image
                  src={category.image.startsWith("data:image") ? category.image : `${BASE_IMAGE_URL}/${category.image}`}
                  alt={category.name}
                  width={400}
                  height={400}
                  unoptimized
                  className="w-12 h-12 object-cover rounded bg-zinc-900 border border-zinc-800"
                />
              </td>
              <td className="px-6 py-4 text-sm font-medium text-white">{category.name}</td>
              <td className="px-6 py-4 text-sm text-zinc-400 max-w-md truncate">{category.description}</td>
              <td className="px-6 py-4 text-xs font-medium text-blue-400">
                <span className="bg-blue-950/40 border border-blue-900 px-2 py-0.5 rounded">{category.tag}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                  <button onClick={() => onEdit(category)} className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-blue-400">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(category.id)} className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const OrdersTabsContainer: React.FC<{
  orders: Order[];
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  setSelectedOrderIdToCancel: (id: string | null) => void;
  setIsCancelModalOpen: (open: boolean) => void;
}> = ({ orders, onUpdateStatus, onDelete, setSelectedOrderIdToCancel, setIsCancelModalOpen }) => {
  const [currentOrderTab, setCurrentOrderTab] = useState<string>("all");
  const [orderSearch, setOrderSearch] = useState("");

  const orderStatuses = [
    { id: "all", label: "Semua Pesanan" },
    { id: "pending", label: "Belum Bayar (Pending)" },
    { id: "waiting_verification", label: "Menunggu Verifikasi" },
    { id: "processing", label: "Diproses" },
    { id: "shipped", label: "Dikirim" },
    { id: "delivered", label: "Sampai Tujuan" },
    { id: "success", label: "Selesai (Success)" },
    { id: "cancelled", label: "Dibatalkan" },
  ];

  const statusFiltered = currentOrderTab === "all" ? orders : orders.filter((o) => o.status === currentOrderTab);
  const finalFilteredOrders = statusFiltered.filter(
    (o) => o.orderCode.toLowerCase().includes(orderSearch.toLowerCase()) || o.product.name.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const handleCopyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Kode order berhasil disalin ke clipboard!");
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-950/40 text-yellow-400 border-yellow-900",
      waiting_verification: "bg-orange-950/40 text-orange-400 border-orange-900",
      processing: "bg-blue-950/40 text-blue-400 border-blue-900",
      shipped: "bg-purple-950/40 text-purple-400 border-purple-900",
      delivered: "bg-green-950/40 text-green-400 border-green-900",
      success: "bg-emerald-950/40 text-emerald-400 border-emerald-900",
      cancelled: "bg-red-950/40 text-red-400 border-red-900",
    };
    return map[status] || "bg-zinc-900/30 text-zinc-400 border-zinc-800";
  };

  return (
    <div className="w-full flex flex-col">
      <div className="p-4 bg-[#1a1a1a] border-b border-zinc-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            placeholder="Cari berdasarkan kode order atau nama produk..."
            className="w-full bg-[#121212] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        </div>
        <div className="text-xs text-zinc-400 font-medium">Ditemukan: <span className="text-white font-bold">{finalFilteredOrders.length}</span> item</div>
      </div>

      <div className="flex border-b border-zinc-800 bg-[#161616] overflow-x-auto scrollbar-none">
        {orderStatuses.map((tab) => {
          const count = tab.id === "all" ? orders.length : orders.filter((o) => o.status === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentOrderTab(tab.id)}
              className={`px-5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all relative flex items-center gap-1.5 ${
                currentOrderTab === tab.id ? "border-blue-500 text-blue-400 bg-zinc-900/40" : "border-transparent text-zinc-400 hover:text-white"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${currentOrderTab === tab.id ? "bg-blue-950 text-blue-300" : "bg-zinc-800 text-zinc-500"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {currentOrderTab === "waiting_verification" && (
        <div className="m-4 p-4 bg-orange-950/30 border border-orange-900/60 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-300 leading-relaxed font-medium">
            <span className="text-orange-400 font-bold block mb-0.5">NB / PERINGATAN ADMIN:</span>
            Sebelum mengubah status pesanan ke <span className="text-blue-400 font-bold">Processing (Diproses)</span>, harap pastikan konsumen sudah mengunggah dana dengan benar. Cek pada menu <span className="text-white underline font-semibold">Bukti Pembayaran</span> untuk memvalidasi kesesuaian foto transfer asli. Gunakan tombol salin kode order di bawah untuk mempermudah pencarian berkas.
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#1e1e1e] border-b border-zinc-800">
            <tr>
              {["Kode Order", "Produk", "Varian", "Total", "Tanggal", "Status", "Pesan", "Aksi"].map((h) => (
                <th key={h} className="text-left px-6 py-4 text-zinc-400 font-semibold text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {finalFilteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-20 text-zinc-500 text-sm">Tidak ada pesanan dalam kategori status ini</td>
              </tr>
            ) : (
              finalFilteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 group">
                      <span className="text-white font-mono text-xs font-semibold tracking-wider">{order.orderCode}</span>
                      <button onClick={() => handleCopyToClipboard(order.orderCode)} className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded transition-colors">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Image src={`${BASE_IMAGE_URL}/${order.product.image}`} alt={order.product.name} width={400} height={400} unoptimized className="w-10 h-10 object-cover rounded bg-zinc-900 border border-zinc-800" />
                      <span className="text-white text-sm font-medium">{order.product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-xs">Size: {order.size} <br/> Color: {order.color}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-white">Rp {parseFloat(order.totalAmount).toLocaleString("id-ID")}</td>
                  <td className="px-6 py-4 text-zinc-400 text-xs">{new Date(order.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => {
                        const nextStatus = e.target.value;
                        if (nextStatus === "cancelled") {
                          setSelectedOrderIdToCancel(order.id);
                          setIsCancelModalOpen(true);
                        } else {
                          onUpdateStatus(order.id, nextStatus);
                        }
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer bg-[#121212] border focus:outline-none ${getStatusColor(order.status)}`}
                    >
                      {["pending", "waiting_verification", "processing", "shipped", "delivered", "success", "cancelled"].map((s) => (
                        <option key={s} value={s} className="bg-zinc-900 text-white capitalize text-sm">{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-xs">{order.notes}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => onDelete(order.id)} className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PaymentProofTable: React.FC<{
  paymentProofs: PaymentProof[];
  onView: (p: PaymentProof) => void;
  onDelete: (id: string) => void;
}> = ({ paymentProofs, onView, onDelete }) => {
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      waiting_verification: "bg-yellow-950/50 text-yellow-400 border border-yellow-900",
      verified: "bg-green-950/50 text-green-400 border border-green-900",
      rejected: "bg-red-950/50 text-red-400 border border-red-900",
    };
    return map[status] || "bg-zinc-900/30 text-zinc-400 border border-zinc-800";
  };
  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = { waiting_verification: "Menunggu Verifikasi", verified: "Terverifikasi", rejected: "Ditolak" };
    return map[status] || status;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#1e1e1e] border-b border-zinc-800">
          <tr>
            {["Kode Order", "User", "Total", "Tanggal Upload", "Status", "Aksi"].map((h) => (
              <th key={h} className="text-left px-6 py-4 text-zinc-400 font-semibold text-xs uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {paymentProofs.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-16 text-zinc-500 text-sm">Tidak ada bukti pembayaran ditemukan</td>
            </tr>
          ) : (
            paymentProofs.map((payment) => (
              <tr key={payment.paymentId} className="hover:bg-zinc-900/30 transition-colors">
                <td className="px-6 py-4 text-white font-mono text-xs font-semibold tracking-wider">{payment.orderCode}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-white">{payment.user.name}</div>
                  <div className="text-zinc-500 text-xs">{payment.user.email}</div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-white">Rp {parseFloat(payment.orderDetail.totalAmount).toLocaleString("id-ID")}</td>
                <td className="px-6 py-4 text-zinc-400 text-xs">{new Date(payment.uploadedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${getStatusColor(payment.orderDetail.status)}`}>{getStatusLabel(payment.orderDetail.status)}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onView(payment)} className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-blue-400">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(payment.paymentId)} className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// ─── NEW COMPONENT: MANAGE USERS PANEL (TAB MENU SEPARATE) ───
const ManageUsersPanel: React.FC<{
  users: UserData[];
  onUpdateRole: (id: string, role: "user" | "admin") => void;
  onDeleteUser: (id: string) => void;
}> = ({ users, onUpdateRole, onDeleteUser }) => {
  const [panelSearch, setPanelSearch] = useState("");

  const finalFilteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(panelSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(panelSearch.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col">
      {/* Search Filter Header */}
      <div className="p-4 bg-[#1a1a1a] border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={panelSearch}
            onChange={(e) => setPanelSearch(e.target.value)}
            placeholder="Cari akun berdasarkan nama lengkap atau alamat email..."
            className="w-full bg-[#121212] border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        </div>
        <div className="text-xs text-zinc-400 font-medium">
          Total Pengguna Terfilter: <span className="text-white font-bold">{finalFilteredUsers.length}</span> Akun
        </div>
      </div>

      {/* Tabel Database User */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#1e1e1e] border-b border-zinc-800">
            <tr>
              {["Nama Lengkap/Pengguna", "Alamat Email Akun", "Otoritas Hak Akses (Role)", "Tanggal Terdaftar", "Aksi Tindakan"].map((h) => (
                <th key={h} className="text-left px-6 py-4 text-zinc-400 font-semibold text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {finalFilteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-20 text-zinc-500 text-sm">Tidak ada data pengguna terdaftar ditemukan</td>
              </tr>
            ) : (
              finalFilteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-white">{user.fullName}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400 break-all">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    {/* Mengubah Role via Dropdown Select */}
                    <select
                      value={user.role}
                      onChange={(e) => onUpdateRole(user.id, e.target.value as "user" | "admin")}
                      className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider cursor-pointer bg-[#121212] border focus:outline-none ${
                        user.role === "admin" 
                          ? "bg-red-950/40 text-red-400 border-red-900/50" 
                          : "bg-blue-950/40 text-blue-400 border-blue-900/50"
                      }`}
                    >
                      <option value="user" className="bg-zinc-900 text-blue-400 text-xs">USER</option>
                      <option value="admin" className="bg-zinc-900 text-red-400 text-xs">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500 font-medium">
                    {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4">
                    {/* Menghapus User Akun */}
                    <button
                      onClick={() => onDeleteUser(user.id)}
                      className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-red-400"
                      title="Hapus Akun Permanen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PaymentDetailModal: React.FC<{
  payment: PaymentProof;
  onClose: () => void;
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
}> = ({ payment, onClose, onVerify, onReject }) => {
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      waiting_verification: "bg-yellow-950 text-yellow-400 border border-yellow-900",
      verified: "bg-green-950 text-green-400 border border-green-900",
      rejected: "bg-red-950 text-red-400 border border-red-900",
    };
    return map[status] || "bg-zinc-900 text-zinc-400 border border-zinc-800";
  };
  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = { waiting_verification: "Menunggu Verifikasi", verified: "Terverifikasi", rejected: "Ditolak" };
    return map[status] || status;
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Detail Bukti Pembayaran</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Status Verifikasi</label>
            <span className={`inline-block px-3 py-1 rounded text-sm font-medium border ${getStatusColor(payment.orderDetail.status)}`}>{getStatusLabel(payment.orderDetail.status)}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#121212] p-3 rounded-lg border border-zinc-800">
              <label className="block text-zinc-500 text-xs mb-0.5">Kode Order</label>
              <p className="text-white font-mono font-semibold tracking-wider">{payment.orderCode}</p>
            </div>
            <div className="bg-[#121212] p-3 rounded-lg border border-zinc-800">
              <label className="block text-zinc-500 text-xs mb-0.5">Total Pembayaran</label>
              <p className="text-blue-400 font-bold">Rp {parseFloat(payment.orderDetail.totalAmount).toLocaleString("id-ID")}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#121212] p-3 rounded-lg border border-zinc-800">
              <label className="block text-zinc-500 text-xs mb-0.5">Nama Pembeli</label>
              <p className="text-white text-sm font-medium">{payment.user.name}</p>
            </div>
            <div className="bg-[#121212] p-3 rounded-lg border border-zinc-800">
              <label className="block text-zinc-500 text-xs mb-0.5">Email</label>
              <p className="text-white text-sm font-medium break-all">{payment.user.email}</p>
            </div>
          </div>
          <div className="bg-[#121212] p-3 rounded-lg border border-zinc-800">
            <label className="block text-zinc-500 text-xs mb-0.5">Waktu Upload</label>
            <p className="text-white text-sm">{new Date(payment.uploadedAt).toLocaleString("id-ID")}</p>
          </div>
          <div>
            <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Bukti Transfer</label>
            <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950 flex justify-center p-2">
              <Image src={`${BASE_IMAGE_URL}/${payment.photoUrl}`} alt="Bukti Pembayaran" width={500} height={500} unoptimized className="max-w-full h-auto max-h-[350px] object-contain rounded" />
            </div>
          </div>
          {payment.orderDetail.status === "waiting_verification" ? (
            <div className="flex gap-3 pt-2">
              <button onClick={() => onVerify(payment.paymentId)} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 text-sm">
                <Check className="w-4 h-4" /> Verifikasi
              </button>
              <button onClick={() => onReject(payment.paymentId)} className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2 text-sm">
                <Ban className="w-4 h-4" /> Tolak
              </button>
            </div>
          ) : (
            <div className="pt-2">
              <button onClick={onClose} className="w-full bg-zinc-800 text-zinc-300 py-2.5 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors font-semibold text-sm">Tutup</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductModal: React.FC<{
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (p: Product) => void;
}> = ({ product, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState<Product>(
    product || { id: "", name: "", code: "", image: "", images: [], description: "", base_price: "", discount_price: "", stock: 0, size: [], color: [], weight: [] }
  );
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [weightInput, setWeightInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.category?.id) { toast.error("Mohon lengkapi data wajib!"); return; }
    if (!formData.image) { toast.error("Gambar utama wajib diupload!"); return; }
    onSave(formData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (!isMain && formData.images.length + files.length > 4) { toast.error("Maksimal 4 gambar tambahan"); return; }
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) { toast.error("File harus berupa gambar"); return; }
      if (file.size > 5 * 1024 * 1024) { toast.error("Ukuran max 5MB"); return; }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isMain) setFormData((prev) => ({ ...prev, image: reader.result as string }));
        else setFormData((prev) => ({ ...prev, images: [...prev.images, reader.result as string] }));
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white">{product ? "Edit Produk" : "Tambah Produk"}</h2>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">Nama Produk*</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#121212] border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-700" required />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">Kode Produk*</label>
              <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full bg-[#121212] border border-zinc-800 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-zinc-700" required />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-medium mb-1.5">Gambar Utama* (max 5MB)</label>
            {!formData.image ? (
              <label className="border-2 border-dashed border-zinc-800 rounded-lg p-6 cursor-pointer hover:border-zinc-700 bg-[#121212] transition-colors block">
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="hidden" />
                <div className="text-center">
                  <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                  <p className="text-zinc-300 text-sm mb-1">Upload Gambar Utama</p>
                  <p className="text-zinc-600 text-xs">JPG, PNG, WEBP (max 5MB)</p>
                </div>
              </label>
            ) : (
              <div className="relative">
                <Image src={formData.image.startsWith("data:image") ? formData.image : `${BASE_IMAGE_URL}/${formData.image}`} alt="Preview" width={400} height={400} unoptimized className="w-full h-44 object-cover rounded-lg border border-zinc-800 bg-[#121212]" />
                <button type="button" onClick={() => setFormData({ ...formData, image: "" })} className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors shadow-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-medium mb-1.5">Gambar Tambahan (max 4)</label>
            <label className={`border-2 border-dashed border-zinc-800 rounded-lg p-4 cursor-pointer hover:border-zinc-700 bg-[#121212] transition-colors block mb-3 ${formData.images.length >= 4 ? "opacity-40 cursor-not-allowed" : ""}`}>
              <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, false)} className="hidden" disabled={formData.images.length >= 4} />
              <div className="text-center">
                <ImageIcon className="w-6 h-6 text-zinc-500 mx-auto mb-1" />
                <p className="text-zinc-300 text-xs">Upload Gambar Tambahan ({formData.images.length}/4)</p>
              </div>
            </label>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {formData.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <Image src={img.startsWith("data:image") ? img : `${BASE_IMAGE_URL}/${img}`} alt={`Additional ${i + 1}`} width={400} height={400} unoptimized className="w-full h-20 object-cover rounded border border-zinc-800 bg-[#121212]" />
                    <button type="button" onClick={() => setFormData({ ...formData, images: formData.images.filter((_, idx) => idx !== i) })} className="absolute -top-1 -right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-medium mb-1.5">Deskripsi</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[#121212] border border-zinc-800 rounded px-3 py-2 text-sm text-white h-20 focus:outline-none focus:border-zinc-700 resize-none" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">Harga Normal*</label>
              <input type="number" value={formData.base_price} onChange={(e) => setFormData({ ...formData, base_price: e.target.value })} className="w-full bg-[#121212] border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-700" required />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">Harga Diskon*</label>
              <input type="number" value={formData.discount_price} onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })} className="w-full bg-[#121212] border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-700" required />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">Stok*</label>
              <input type="number" value={formData.stock || 0} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} className="w-full bg-[#121212] border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-700" required />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-medium mb-1.5">Kategori*</label>
            <select value={formData.category?.id || ""} onChange={(e) => {
              const cat = categories.find((c) => c.id === e.target.value);
              if (cat) setFormData({ ...formData, category: { id: cat.id, name: cat.name } });
            }} className="w-full bg-[#121212] border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-700" required>
              <option value="" className="text-zinc-600">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {[
            { label: "Ukuran", key: "size" as const, input: sizeInput, setInput: setSizeInput, placeholder: "S, M, L, XL", suffix: "" },
            { label: "Warna", key: "color" as const, input: colorInput, setInput: setColorInput, placeholder: "Black, White, Red", suffix: "" },
            { label: "Berat (gram)", key: "weight" as const, input: weightInput, setInput: setWeightInput, placeholder: "500, 800, 1000", suffix: "g" },
          ].map(({ label, key, input, setInput, placeholder, suffix }) => (
            <div key={key} className="bg-[#121212] p-3 rounded-lg border border-zinc-800/60">
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">{label}</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (input && !formData[key].includes(input)) { setFormData({ ...formData, [key]: [...formData[key], input] }); setInput(""); }
                  }
                }} className="flex-1 bg-[#161616] border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700" placeholder={`Contoh: ${placeholder}`} />
                <button type="button" onClick={() => { if (input && !formData[key].includes(input)) { setFormData({ ...formData, [key]: [...formData[key], input] }); setInput(""); } }} className="bg-zinc-800 px-3 py-1.5 rounded text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors">Tambah</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData[key].map((val) => (
                  <span key={val} className="bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded text-zinc-200 text-xs flex items-center gap-1.5 font-medium">
                    {val}{suffix}
                    <button type="button" onClick={() => setFormData({ ...formData, [key]: formData[key].filter((i) => i !== val) })} className="text-red-400 hover:text-red-300 font-bold text-sm">&times;</button>
                  </span>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-white text-black py-2.5 rounded-lg hover:bg-zinc-200 transition-colors font-semibold flex items-center justify-center gap-2 text-sm">
              <Save className="w-4 h-4" /> Simpan
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-zinc-800 text-zinc-300 py-2.5 rounded-lg hover:bg-zinc-700 transition-colors font-semibold text-sm">Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AprioriAnalytics: React.FC<{
  params: AprioriParams;
  setParams: (params: AprioriParams) => void;
  analysis: AprioriAnalysis | null;
  isLoading: boolean;
  isSyncing: boolean;
  onRunAnalysis: () => void;
  onSyncRecommendation: () => void;
}> = ({ params, setParams, analysis, isLoading, isSyncing, onRunAnalysis, onSyncRecommendation }) => {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-[#121212] rounded-xl p-6 border border-zinc-800">
        <div className="flex items-center gap-2 mb-5">
          <Calendar className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-white">Parameter Aturan Asosiasi</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-zinc-400 text-xs mb-1.5">Tanggal Mulai</label>
            <input type="date" value={params.startDate} onChange={(e) => setParams({ ...params, startDate: e.target.value })} className="w-full bg-[#161616] border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-700" />
          </div>
          <div>
            <label className="block text-zinc-400 text-xs mb-1.5">Tanggal Akhir</label>
            <input type="date" value={params.endDate} onChange={(e) => setParams({ ...params, endDate: e.target.value })} className="w-full bg-[#161616] border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-700" />
          </div>
          <div className="bg-[#161616] p-4 rounded-lg border border-zinc-800/80">
            <label className="block text-zinc-400 text-xs font-medium mb-2">Minimum Support ({(params.minSupport * 100).toFixed(0)}%)</label>
            <input type="range" min="0" max="1" step="0.01" value={params.minSupport} onChange={(e) => setParams({ ...params, minSupport: parseFloat(e.target.value) })} className="w-full accent-blue-500" />
            <div className="flex justify-between text-[10px] text-zinc-600 mt-1 font-mono"><span>0%</span><span>100%</span></div>
          </div>
          <div className="bg-[#161616] p-4 rounded-lg border border-zinc-800/80">
            <label className="block text-zinc-400 text-xs font-medium mb-2">Minimum Confidence ({(params.minConfidence * 100).toFixed(0)}%)</label>
            <input type="range" min="0" max="1" step="0.01" value={params.minConfidence} onChange={(e) => setParams({ ...params, minConfidence: parseFloat(e.target.value) })} className="w-full accent-green-500" />
            <div className="flex justify-between text-[10px] text-zinc-600 mt-1 font-mono"><span>0%</span><span>100%</span></div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-zinc-800/60 pt-4">
          <button onClick={onRunAnalysis} disabled={isLoading || isSyncing} className="bg-white text-black px-5 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors text-sm font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            <TrendingUp className="w-4 h-4" /> {isLoading ? "Memproses Data..." : "Proses Aturan Apriori"}
          </button>
          {analysis && (
            <button onClick={onSyncRecommendation} disabled={isLoading || isSyncing} className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              <Check className="w-4 h-4" /> {isSyncing ? "Menyinkronkan..." : "Sinkronkan Rekomendasi"}
            </button>
          )}
        </div>
      </div>

      {analysis && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#121212] rounded-xl p-4 border border-zinc-800">
              <div className="text-zinc-500 text-xs mb-1 font-medium uppercase tracking-wider">Rentang Penjualan</div>
              <div className="text-white font-semibold text-sm">
                {new Date(analysis.period.start).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} - {new Date(analysis.period.end).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
            <div className="bg-[#121212] rounded-xl p-4 border border-zinc-800">
              <div className="text-zinc-500 text-xs mb-1 font-medium uppercase tracking-wider">Dataset Transaksi</div>
              <div className="text-white font-bold text-xl">{analysis.total_transactions} <span className="text-xs text-zinc-500 font-normal">Nota</span></div>
            </div>
            <div className="bg-[#121212] rounded-xl p-4 border border-zinc-800">
              <div className="text-zinc-500 text-xs mb-1 font-medium uppercase tracking-wider">Aturan Terbentuk</div>
              <div className="text-blue-400 font-bold text-xl">{analysis.rules.length} <span className="text-xs text-zinc-500 font-normal">Pola</span></div>
            </div>
          </div>

          <div className="bg-[#121212] rounded-xl border border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 bg-[#161616]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><BarChart3 className="w-4 h-4 text-green-400" /> Matriks Association Rules</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#181818] border-b border-zinc-800">
                  <tr>
                    <th className="text-left px-6 py-3.5 text-zinc-400 font-semibold text-xs uppercase tracking-wider">Antecedent (Jika Membeli)</th>
                    <th className="text-left px-6 py-3.5 text-zinc-400 font-semibold text-xs uppercase tracking-wider">Consequent (Maka Membeli)</th>
                    <th className="text-left px-6 py-3.5 text-zinc-400 font-semibold text-xs uppercase tracking-wider w-1/4">Nilai Support</th>
                    <th className="text-left px-6 py-3.5 text-zinc-400 font-semibold text-xs uppercase tracking-wider w-1/4">Nilai Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {analysis.rules.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-16 text-zinc-500 text-sm">Tidak ada pola asosiasi yang memenuhi ambang batas minimum</td></tr>
                  ) : (
                    analysis.rules.map((rule, index) => (
                      <tr key={index} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-white text-sm font-medium">{rule.productA}</div>
                          <div className="text-zinc-600 text-[10px] font-mono mt-0.5">SKU: {rule.if_buy}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white text-sm font-medium">{rule.productB}</div>
                          <div className="text-zinc-600 text-[10px] font-mono mt-0.5">SKU: {rule.then_buy}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden"><div className="bg-blue-500 h-full rounded-full" style={{ width: `${rule.support * 100}%` }} /></div>
                            <span className="text-zinc-300 text-xs font-mono font-semibold min-w-[42px] text-right">{(rule.support * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden"><div className="bg-green-500 h-full rounded-full" style={{ width: `${rule.confidence * 100}%` }} /></div>
                            <span className="text-zinc-300 text-xs font-mono font-semibold min-w-[42px] text-right">{(rule.confidence * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!analysis && !isLoading && (
        <div className="text-center py-20 text-zinc-600 bg-[#121212] rounded-xl border border-zinc-800">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30 text-zinc-500" />
          <p className="text-sm">Silakan tentukan parameter di atas lalu tekan tombol "Proses Aturan Apriori"</p>
        </div>
      )}
    </div>
  );
};

const CategoryModal: React.FC<{
  category: Category | null;
  onClose: () => void;
  onSave: (c: Category) => void;
}> = ({ category, onClose, onSave }) => {
  const [formData, setFormData] = useState<Category>(category || { id: "", name: "", image: "", description: "", tag: "" });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.image) { toast.error("Nama dan gambar wajib diisi!"); return; }
    onSave(formData);
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("File harus berupa gambar"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Ukuran file maksimal 5MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setFormData({ ...formData, image: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl max-w-lg w-full shadow-2xl">
        <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{category ? "Edit Kategori" : "Tambah Kategori"}</h2>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-md"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-zinc-400 text-xs font-medium mb-1.5">Nama Kategori*</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#121212] border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-700" required />
          </div>
          <div>
            <label className="block text-zinc-400 text-xs font-medium mb-1.5">Gambar Kategori* (max 5MB)</label>
            {!formData.image ? (
              <label className="border-2 border-dashed border-zinc-800 rounded-lg p-6 cursor-pointer hover:border-zinc-700 bg-[#121212] transition-colors block">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <div className="text-center">
                  <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                  <p className="text-zinc-300 text-sm mb-1">Upload Gambar Kategori</p>
                  <p className="text-zinc-600 text-xs">JPG, PNG, WEBP (max 5MB)</p>
                </div>
              </label>
            ) : (
              <div className="relative">
                <Image src={formData.image.startsWith("data:image") ? formData.image : `${BASE_IMAGE_URL}/${formData.image}`} alt="Preview" width={400} height={400} unoptimized className="w-full h-44 object-cover rounded-lg border border-zinc-800 bg-[#121212]" />
                <button type="button" onClick={() => setFormData({ ...formData, image: "" })} className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 shadow-lg"><X className="w-4 h-4" /></button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-zinc-400 text-xs font-medium mb-1.5">Deskripsi</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[#121212] border border-zinc-800 rounded px-3 py-2 text-sm text-white h-20 focus:outline-none focus:border-zinc-700 resize-none" />
          </div>
          <div>
            <label className="block text-zinc-400 text-xs font-medium mb-1.5">Tag</label>
            <input type="text" value={formData.tag} onChange={(e) => setFormData({ ...formData, tag: e.target.value })} className="w-full bg-[#121212] border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-700" placeholder="#hashtag" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-white text-black py-2.5 rounded-lg hover:bg-zinc-200 transition-colors font-semibold flex items-center justify-center gap-2 text-sm"><Save className="w-4 h-4" /> Simpan</button>
            <button type="button" onClick={onClose} className="flex-1 bg-zinc-800 text-zinc-300 py-2.5 rounded-lg hover:bg-zinc-700 transition-colors font-semibold text-sm">Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CancelOrderModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  setReason: (val: string) => void;
  onConfirm: () => void;
}> = ({ isOpen, onClose, reason, setReason, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between bg-[#161616]">
          <h2 className="text-md font-bold text-white flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-500" /> Konfirmasi Pembatalan</h2>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-md"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed">Mohon isi alasan pembatalan pesanan ini. Catatan ini akan disimpan ke dalam sistem (`notes`) sebagai dokumentasi valid dan dapat dilihat oleh konsumen.</p>
          <div>
            <label className="block text-zinc-400 text-xs font-medium mb-1.5">Alasan Pembatalan*</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Contoh: Stok produk habis / Konsumen meminta ganti varian..." className="w-full bg-[#121212] border border-zinc-800 rounded-lg p-3 text-xs text-white h-24 focus:outline-none focus:border-zinc-700 resize-none placeholder:text-zinc-600" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors font-semibold text-xs flex items-center justify-center gap-1.5"><Check className="w-3.5 h-3.5" /> Batalkan Pesanan</button>
            <button type="button" onClick={onClose} className="flex-1 bg-zinc-800 text-zinc-300 py-2 rounded-lg hover:bg-zinc-700 transition-colors font-semibold text-xs">Kembali</button>
          </div>
        </div>
      </div>
    </div>
  );
};