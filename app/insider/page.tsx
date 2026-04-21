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
} from "lucide-react";
import { toast } from "sonner";
import { clientFetch } from "@/lib/apiFetch";
import Image from "next/image";
import { BASE_IMAGE_URL } from "../components/base-api";
import { urlToFile } from "@/lib/url-to-file";

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

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<
    "products" | "categories" | "orders" | "payments" | "analytics"
  >("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Apriori Analytics states
  const [aprioriAnalysis, setAprioriAnalysis] =
    useState<AprioriAnalysis | null>(null);
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
  const [isPaymentDetailModalOpen, setIsPaymentDetailModalOpen] =
    useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentProof | null>(
    null,
  );

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [productsRes, categoriesRes, ordersRes, paymentsRes] =
        await Promise.all([
          clientFetch("/products"),
          clientFetch("/categories"),
          clientFetch("/orders/all"),
          clientFetch("/payments/recent"),
        ]);
      if (productsRes?.data) setProducts(productsRes.data);
      if (categoriesRes?.data) setCategories(categoriesRes.data);
      if (ordersRes?.data) setOrders(ordersRes.data);
      if (paymentsRes?.data) setPaymentProofs(paymentsRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data");
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
    formData.append("stock", product.stock);
    formData.append("category_id", product.category.id);

    if (product.image && product.image.startsWith("data:image")) {
      const mainImageFile = await urlToFile(
        product.image,
        "main-image.png",
        "image/png",
      );
      formData.append("image", mainImageFile);
    } else {
      formData.append("image", product.image);
    }

    if (Array.isArray(product.images)) {
      let counter = 0;
      for (const imgData of product.images) {
        if (typeof imgData === "string" && imgData.startsWith("data:image")) {
          const fileBinary = await urlToFile(
            imgData,
            `additional-image-${counter}.png`,
            "image/png",
          );
          formData.append("images", fileBinary);
        } else {
          // Kalau sudah dalam bentuk File atau string nama file lama, langsung append
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
        await clientFetch(`/products/${product.id}`, {
          method: "PATCH",
          body: formData,
        });
        setProducts(products.map((p) => (p.id === product.id ? product : p)));
        toast.success("Produk berhasil diupdate!");
      } else {
        const res = await clientFetch("/products", {
          method: "POST",
          body: formData,
        });
        setProducts([
          ...products,
          res.data || { ...product, id: crypto.randomUUID() },
        ]);
        toast.success("Produk berhasil ditambahkan!");
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
      const mainImageFile = await urlToFile(
        category.image,
        "main-image.png",
        "image/png",
      );
      formData.append("image", mainImageFile);
    } else {
      formData.append("image", category.image);
    }
    formData.append("description", category.description);
    formData.append("tag", category.tag);

    try {
      if (editingCategory) {
        await clientFetch(`/categories/${category.id}`, {
          method: "PATCH",
          body: formData,
        });
        setCategories(
          categories.map((c) => (c.id === category.id ? category : c)),
        );
        toast.success("Kategori berhasil diupdate!");
      } else {
        const res = await clientFetch("/categories", {
          method: "POST",
          body: formData,
        });
        setCategories([
          ...categories,
          res.data || { ...category, id: crypto.randomUUID() },
        ]);
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
    } catch (error) {
      toast.error("Gagal mengupdate status");
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus order ini?")) return;
    try {
      await clientFetch(`/orders/${id}`, { method: "DELETE" });
      setOrders(orders.filter((o) => o.id !== id));
      toast.success("Order berhasil dihapus!");
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
          p.paymentId === paymentId
            ? { ...p, orderDetail: { ...p.orderDetail, status: "verified" } }
            : p,
        ),
      );
      toast.success("Bukti pembayaran berhasil diverifikasi!");
      setIsPaymentDetailModalOpen(false);
    } catch (error) {
      toast.error("Gagal verifikasi pembayaran");
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    try {
      await clientFetch(`/payments/${paymentId}/reject`, { method: "PATCH" });
      setPaymentProofs(
        paymentProofs.map((p) =>
          p.paymentId === paymentId
            ? { ...p, orderDetail: { ...p.orderDetail, status: "rejected" } }
            : p,
        ),
      );
      toast.success("Bukti pembayaran ditolak!");
      setIsPaymentDetailModalOpen(false);
    } catch (error) {
      toast.error("Gagal menolak pembayaran");
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus bukti pembayaran ini?"))
      return;
    try {
      await clientFetch(`/payments/${paymentId}`, { method: "DELETE" });
      setPaymentProofs(paymentProofs.filter((p) => p.paymentId !== paymentId));
      toast.success("Bukti pembayaran berhasil dihapus!");
    } catch (error) {
      toast.error("Gagal menghapus bukti pembayaran");
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
      console.log("API Call: /analyze?" + queryParams.toString());
  
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAprioriAnalysis(res.data);
      setIsLoadingAnalysis(false);
      toast.success("Analisis berhasil dilakukan!");
    } catch (error) {
      console.log(error);
      toast.error("Analisis gagal dilakukann!");
      setIsLoadingAnalysis(false);
    }
  };

  const handleSyncRecommendation = async () => {
    setIsSyncingRecommendation(true);

    // Prepare request body
    const requestBody = {
      minSupport: aprioriParams.minSupport,
      minConfidience: aprioriParams.minConfidence,
      startDate: aprioriParams.startDate,
      endDate: aprioriParams.endDate,
    };

    try {
      await clientFetch("/sync", {
        method: 'POST',
        body: JSON.stringify(requestBody, null, 2),
      })
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("API Call: POST /sync");
      console.log("Request Body:", JSON.stringify(requestBody, null, 2));
      setIsSyncingRecommendation(false);
      toast.success("Hasil apriori berhasil disync ke tabel rekomendasi!");
    } catch (error) {
      console.log(error);
      toast.error("Hasil apriori gagal disync ke tabel rekomendasi");
      setIsSyncingRecommendation(false);
    }
  };

  const tabs = [
    { id: "products", label: "Produk", icon: Package },
    { id: "categories", label: "Kategori", icon: FolderOpen },
    { id: "orders", label: "Pesanan", icon: ShoppingCart },
    { id: "payments", label: "Bukti Pembayaran", icon: Receipt },
    { id: "analytics", label: "Analitik Apriori", icon: BarChart3 },
  ];

  const filteredProducts = products.filter(
    (p) =>
      p?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p?.code?.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredOrders = orders.filter(
    (o) =>
      o.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredPaymentProofs = paymentProofs.filter(
    (p) =>
      p.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-zinc-400">
            Kelola produk, kategori, dan pesanan Mahen Store
          </p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-zinc-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearchQuery("");
                }}
                className={`flex items-center gap-2 px-6 py-3 transition-colors relative ${
                  activeTab === tab.id
                    ? "text-white border-b-2 border-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
          {activeTab !== "analytics" && (
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Cari ${activeTab === "products" ? "produk" : activeTab === "categories" ? "kategori" : activeTab === "orders" ? "pesanan" : "bukti pembayaran"}...`}
                className="w-full bg-[#121212] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            </div>

            {activeTab !== "orders" && activeTab !== "payments" && (
              <button
                onClick={() => {
                  if (activeTab === "products") {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  } else {
                    setEditingCategory(null);
                    setIsCategoryModalOpen(true);
                  }
                }}
                className="bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2 font-semibold"
              >
                <Plus className="w-5 h-5" />
                Tambah {activeTab === "products" ? "Produk" : "Kategori"}
              </button>
            )}
          </div>
          )}

        <div className="bg-[#121212] border border-zinc-800 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="text-center py-16 text-zinc-500">
              Memuat data...
            </div>
          ) : (
            <>
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
                <OrdersTable
                  orders={filteredOrders}
                  onUpdateStatus={handleUpdateOrderStatus}
                  onDelete={handleDeleteOrder}
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
      </div>

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

// ─── Sub Components (tidak berubah strukturnya, hanya dipastikan tidak ada React Router) ───

const ProductsTable: React.FC<{
  products: Product[];
  categories: Category[];
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
}> = ({ products, onEdit, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-zinc-900">
        <tr>
          {["Gambar", "Nama", "Kode", "Kategori", "Harga", "Stok", "Aksi"].map(
            (h) => (
              <th
                key={h}
                className="text-left px-6 py-4 text-zinc-400 font-semibold text-sm"
              >
                {h}
              </th>
            ),
          )}
        </tr>
      </thead>
      <tbody>
        {products.length === 0 ? (
          <tr>
            <td colSpan={7} className="text-center py-12 text-zinc-500">
              Tidak ada produk ditemukan
            </td>
          </tr>
        ) : (
          products.map((product) => (
            <tr
              key={product.id}
              className="border-t border-zinc-800 hover:bg-zinc-900/50"
            >
              <td className="px-6 py-4">
                <Image
                  src={
                    product.image.startsWith("data:image")
                      ? product.image
                      : `${BASE_IMAGE_URL}/${product.image}`
                  }
                  alt={product.name}
                  width={400}
                  height={400}
                  unoptimized
                  className="w-16 h-20 object-cover rounded"
                />
              </td>
              <td className="px-6 py-4 text-white">{product.name}</td>
              <td className="px-6 py-4 text-zinc-400 font-mono text-sm">
                {product.code}
              </td>
              <td className="px-6 py-4 text-zinc-400">
                {product.category.name}
              </td>
              <td className="px-6 py-4">
                <div className="text-white">
                  Rp{" "}
                  {parseFloat(product.discount_price).toLocaleString("id-ID")}
                </div>
                {product.discount_price !== product.base_price && (
                  <div className="text-zinc-500 text-sm line-through">
                    Rp {parseFloat(product.base_price).toLocaleString("id-ID")}
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded text-sm ${product.stock > 10 ? "bg-green-900/30 text-green-400" : product.stock > 0 ? "bg-yellow-900/30 text-yellow-400" : "bg-red-900/30 text-red-400"}`}
                >
                  {product.stock}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="p-2 hover:bg-zinc-800 rounded transition-colors text-blue-400"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="p-2 hover:bg-zinc-800 rounded transition-colors text-red-400"
                  >
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
      <thead className="bg-zinc-900">
        <tr>
          {["Gambar", "Nama", "Deskripsi", "Tag", "Aksi"].map((h) => (
            <th
              key={h}
              className="text-left px-6 py-4 text-zinc-400 font-semibold text-sm"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {categories.length === 0 ? (
          <tr>
            <td colSpan={5} className="text-center py-12 text-zinc-500">
              Tidak ada kategori ditemukan
            </td>
          </tr>
        ) : (
          categories.map((category) => (
            <tr
              key={category.id}
              className="border-t border-zinc-800 hover:bg-zinc-900/50"
            >
              <td className="px-6 py-4">
                <Image
                  src={
                    category.image.startsWith("data:image")
                      ? category.image
                      : `${BASE_IMAGE_URL}/${category.image}`
                  }
                  alt={category.name}
                  width={400}
                  height={400}
                  unoptimized
                  className="w-16 h-16 object-cover rounded"
                />
              </td>
              <td className="px-6 py-4 text-white">{category.name}</td>
              <td className="px-6 py-4 text-zinc-400 max-w-md truncate">
                {category.description}
              </td>
              <td className="px-6 py-4 text-blue-400">{category.tag}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(category)}
                    className="p-2 hover:bg-zinc-800 rounded transition-colors text-blue-400"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(category.id)}
                    className="p-2 hover:bg-zinc-800 rounded transition-colors text-red-400"
                  >
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

const OrdersTable: React.FC<{
  orders: Order[];
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}> = ({ orders, onUpdateStatus, onDelete }) => {
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-900/30 text-yellow-400",
      waiting_verification: "bg-orange-900 text-orange-400",
      processing: "bg-blue-900/30 text-blue-400",
      shipped: "bg-purple-900/30 text-purple-400",
      delivered: "bg-green-900/30 text-green-400",
      success: "bg-emerald-900/30 text-emerald-400",
      cancelled: "bg-red-900/30 text-red-400",
    };
    return map[status] || "bg-zinc-900/30 text-zinc-400";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-zinc-900">
          <tr>
            {[
              "Kode Order",
              "Produk",
              "Varian",
              "Total",
              "Tanggal",
              "Status",
              "Aksi",
            ].map((h) => (
              <th
                key={h}
                className="text-left px-6 py-4 text-zinc-400 font-semibold text-sm"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-12 text-zinc-500">
                Tidak ada pesanan ditemukan
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr
                key={order.id}
                className="border-t border-zinc-800 hover:bg-zinc-900/50"
              >
                <td className="px-6 py-4 text-white font-mono text-sm">
                  {order.orderCode}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={`${BASE_IMAGE_URL}/${order.product.image}`}
                      alt={order.product.name}
                      width={400}
                      height={400}
                      unoptimized
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span className="text-white">{order.product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-400 text-sm">
                  {order.size} / {order.color}
                </td>
                <td className="px-6 py-4 text-white">
                  Rp {parseFloat(order.totalAmount).toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4 text-zinc-400 text-sm">
                  {new Date(order.createdAt).toLocaleDateString("id-ID")}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                    className={`px-3 py-1 rounded text-sm cursor-pointer bg-transparent border border-current ${getStatusColor(order.status)}`}
                  >
                    {[
                      "pending",
                      "waiting_verification",
                      "processing",
                      "shipped",
                      "delivered",
                      "success",
                      "cancelled",
                    ].map((s) => (
                      <option
                        key={s}
                        value={s}
                        className="bg-zinc-900 text-white capitalize"
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onDelete(order.id)}
                    className="p-2 hover:bg-zinc-800 rounded transition-colors text-red-400"
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
  );
};

const PaymentProofTable: React.FC<{
  paymentProofs: PaymentProof[];
  onView: (p: PaymentProof) => void;
  onDelete: (id: string) => void;
}> = ({ paymentProofs, onView, onDelete }) => {
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      waiting_verification: "bg-yellow-900/30 text-yellow-400",
      verified: "bg-green-900/30 text-green-400",
      rejected: "bg-red-900/30 text-red-400",
    };
    return map[status] || "bg-zinc-900/30 text-zinc-400";
  };
  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      waiting_verification: "Menunggu Verifikasi",
      verified: "Terverifikasi",
      rejected: "Ditolak",
    };
    return map[status] || status;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-zinc-900">
          <tr>
            {[
              "Kode Order",
              "User",
              "Total",
              "Tanggal Upload",
              "Status",
              "Aksi",
            ].map((h) => (
              <th
                key={h}
                className="text-left px-6 py-4 text-zinc-400 font-semibold text-sm"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paymentProofs.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-zinc-500">
                Tidak ada bukti pembayaran ditemukan
              </td>
            </tr>
          ) : (
            paymentProofs.map((payment) => (
              <tr
                key={payment.paymentId}
                className="border-t border-zinc-800 hover:bg-zinc-900/50"
              >
                <td className="px-6 py-4 text-white font-mono text-sm">
                  {payment.orderCode}
                </td>
                <td className="px-6 py-4">
                  <div className="text-white">{payment.user.name}</div>
                  <div className="text-zinc-400 text-sm">
                    {payment.user.email}
                  </div>
                </td>
                <td className="px-6 py-4 text-white">
                  Rp{" "}
                  {parseFloat(payment.orderDetail.totalAmount).toLocaleString(
                    "id-ID",
                  )}
                </td>
                <td className="px-6 py-4 text-zinc-400 text-sm">
                  {new Date(payment.uploadedAt).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded text-sm ${getStatusColor(payment.orderDetail.status)}`}
                  >
                    {getStatusLabel(payment.orderDetail.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(payment)}
                      className="p-2 hover:bg-zinc-800 rounded transition-colors text-blue-400"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(payment.paymentId)}
                      className="p-2 hover:bg-zinc-800 rounded transition-colors text-red-400"
                    >
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

const PaymentDetailModal: React.FC<{
  payment: PaymentProof;
  onClose: () => void;
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
}> = ({ payment, onClose, onVerify, onReject }) => {
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      waiting_verification: "bg-yellow-900/30 text-yellow-400",
      verified: "bg-green-900/30 text-green-400",
      rejected: "bg-red-900/30 text-red-400",
    };
    return map[status] || "bg-zinc-900/30 text-zinc-400";
  };
  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      waiting_verification: "Menunggu Verifikasi",
      verified: "Terverifikasi",
      rejected: "Ditolak",
    };
    return map[status] || status;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121212] border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#121212] border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Detail Bukti Pembayaran
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Status</label>
            <span
              className={`inline-block px-4 py-2 rounded ${getStatusColor(payment.orderDetail.status)}`}
            >
              {getStatusLabel(payment.orderDetail.status)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Kode Order
              </label>
              <p className="text-white font-mono">{payment.orderCode}</p>
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Total Pembayaran
              </label>
              <p className="text-white font-semibold">
                Rp{" "}
                {parseFloat(payment.orderDetail.totalAmount).toLocaleString(
                  "id-ID",
                )}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Nama Pembeli
              </label>
              <p className="text-white">{payment.user.name}</p>
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Email</label>
              <p className="text-white">{payment.user.email}</p>
            </div>
          </div>
          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Waktu Upload
            </label>
            <p className="text-white">
              {new Date(payment.uploadedAt).toLocaleString("id-ID", {
                dateStyle: "full",
                timeStyle: "medium",
              })}
            </p>
          </div>
          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Bukti Transfer
            </label>
            <div className="border border-zinc-800 rounded-lg overflow-hidden">
              <Image
                src={`${BASE_IMAGE_URL}/${payment.photoUrl}`}
                alt="Bukti Pembayaran"
                width={400}
                height={400}
                unoptimized
                className="w-full h-auto object-contain bg-zinc-900"
              />
            </div>
          </div>
          {payment.orderDetail.status === "waiting_verification" ? (
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => onVerify(payment.paymentId)}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" /> Verifikasi
              </button>
              <button
                onClick={() => onReject(payment.paymentId)}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Ban className="w-5 h-5" /> Tolak
              </button>
            </div>
          ) : (
            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full bg-zinc-800 text-white py-3 rounded-lg hover:bg-zinc-700 transition-colors font-semibold"
              >
                Tutup
              </button>
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
    product || {
      id: "",
      name: "",
      code: "",
      image: "",
      images: [],
      description: "",
      base_price: "",
      discount_price: "",
      stock: 0,
      size: [],
      color: [],
      weight: [],
      category: { id: "", name: "" },
    },
  );
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [weightInput, setWeightInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.category.id) {
      toast.error("Mohon lengkapi data yang diperlukan!");
      return;
    }
    if (!formData.image) {
      toast.error("Gambar utama wajib diupload!");
      return;
    }
    onSave(formData);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isMain: boolean,
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (!isMain && formData.images.length + files.length > 4) {
      toast.error("Maksimal 4 gambar tambahan");
      return;
    }
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} bukan file gambar`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} terlalu besar (max 5MB)`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isMain)
          setFormData((prev) => ({ ...prev, image: reader.result as string }));
        else
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, reader.result as string],
          }));
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121212] border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#121212] border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {product ? "Edit Produk" : "Tambah Produk"}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Nama Produk*
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Kode Produk*
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Gambar Utama* (max 5MB)
            </label>
            {!formData.image ? (
              <label className="border-2 border-dashed border-zinc-700 rounded-lg p-6 cursor-pointer hover:border-zinc-600 transition-colors block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  className="hidden"
                />
                <div className="text-center">
                  <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-2" />
                  <p className="text-white text-sm mb-1">Upload Gambar Utama</p>
                  <p className="text-zinc-500 text-xs">
                    JPG, PNG, WEBP (max 5MB)
                  </p>
                </div>
              </label>
            ) : (
              <div className="relative">
                <Image
                  src={
                    formData.image.startsWith("data:image")
                      ? formData.image
                      : `${BASE_IMAGE_URL}/${formData.image}`
                  }
                  alt="Preview"
                  width={400}
                  height={400}
                  unoptimized
                  className="w-full h-48 object-cover rounded-lg border border-zinc-800"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image: "" })}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Gambar Tambahan (max 4)
            </label>
            <label
              className={`border-2 border-dashed border-zinc-700 rounded-lg p-4 cursor-pointer hover:border-zinc-600 transition-colors block mb-3 ${formData.images.length >= 4 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e, false)}
                className="hidden"
                disabled={formData.images.length >= 4}
              />
              <div className="text-center">
                <ImageIcon className="w-8 h-8 text-zinc-500 mx-auto mb-1" />
                <p className="text-white text-sm">
                  Upload Gambar Tambahan ({formData.images.length}/4)
                </p>
              </div>
            </label>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {formData.images.map((img, i) => (
                  <div key={i} className="relative">
                    <Image
                      src={
                        img.startsWith("data:image")
                          ? img
                          : `${BASE_IMAGE_URL}/${img}`
                      }
                      alt={`Additional ${i + 1}`}
                      width={400}
                      height={400}
                      unoptimized
                      className="w-full h-24 object-cover rounded border border-zinc-800"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          images: formData.images.filter((_, idx) => idx !== i),
                        })
                      }
                      className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Deskripsi
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white h-24"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Harga Normal*
              </label>
              <input
                type="number"
                value={formData.base_price}
                onChange={(e) =>
                  setFormData({ ...formData, base_price: e.target.value })
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Harga Diskon*
              </label>
              <input
                type="number"
                value={formData.discount_price}
                onChange={(e) =>
                  setFormData({ ...formData, discount_price: e.target.value })
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Stok*</label>
              <input
                type="number"
                value={formData.stock || 0}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value) })
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Kategori*
            </label>
            <select
              value={formData.category.id}
              onChange={(e) => {
                const cat = categories.find((c) => c.id === e.target.value);
                if (cat)
                  setFormData({
                    ...formData,
                    category: { id: cat.id, name: cat.name },
                  });
              }}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white"
              required
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {[
            {
              label: "Ukuran",
              key: "size" as const,
              input: sizeInput,
              setInput: setSizeInput,
              placeholder: "S, M, L, XL",
              suffix: "",
            },
            {
              label: "Warna",
              key: "color" as const,
              input: colorInput,
              setInput: setColorInput,
              placeholder: "Black, White, Red",
              suffix: "",
            },
            {
              label: "Berat (gram)",
              key: "weight" as const,
              input: weightInput,
              setInput: setWeightInput,
              placeholder: "500, 800, 1000",
              suffix: "g",
            },
          ].map(({ label, key, input, setInput, placeholder, suffix }) => (
            <div key={key}>
              <label className="block text-zinc-400 text-sm mb-2">
                {label}
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (input && !formData[key].includes(input)) {
                        setFormData({
                          ...formData,
                          [key]: [...formData[key], input],
                        });
                        setInput("");
                      }
                    }
                  }}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white"
                  placeholder={`Contoh: ${placeholder}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (input && !formData[key].includes(input)) {
                      setFormData({
                        ...formData,
                        [key]: [...formData[key], input],
                      });
                      setInput("");
                    }
                  }}
                  className="bg-zinc-800 px-4 py-2 rounded text-white hover:bg-zinc-700"
                >
                  Tambah
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData[key].map((val) => (
                  <span
                    key={val}
                    className="bg-zinc-800 px-3 py-1 rounded text-white text-sm flex items-center gap-2"
                  >
                    {val}
                    {suffix}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          [key]: formData[key].filter((i) => i !== val),
                        })
                      }
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-white text-black py-3 rounded-lg hover:bg-zinc-200 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Simpan
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 text-white py-3 rounded-lg hover:bg-zinc-700 transition-colors font-semibold"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Apriori Analytics Component
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
      {/* Parameter Form */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Parameter Analisis</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Tanggal Mulai</label>
            <input
              type="date"
              value={params.startDate}
              onChange={(e) => setParams({ ...params, startDate: e.target.value })}
              className="w-full bg-[#121212] border border-zinc-800 rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">Tanggal Akhir</label>
            <input
              type="date"
              value={params.endDate}
              onChange={(e) => setParams({ ...params, endDate: e.target.value })}
              className="w-full bg-[#121212] border border-zinc-800 rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Minimum Support ({(params.minSupport * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={params.minSupport}
              onChange={(e) => setParams({ ...params, minSupport: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Minimum Confidence ({(params.minConfidence * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={params.minConfidence}
              onChange={(e) => setParams({ ...params, minConfidence: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onRunAnalysis}
            disabled={isLoading || isSyncing}
            className="bg-white text-black px-6 py-3 rounded-lg hover:bg-zinc-200 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingUp className="w-5 h-5" />
            {isLoading ? 'Memproses...' : 'Jalankan Analisis'}
          </button>

          {analysis && (
            <button
              onClick={onSyncRecommendation}
              disabled={isLoading || isSyncing}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5" />
              {isSyncing ? 'Syncing...' : 'Sync ke Rekomendasi'}
            </button>
          )}
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div className="text-zinc-400 text-sm mb-1">Periode Analisis</div>
              <div className="text-white font-semibold">
                {new Date(analysis.period.start).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}{' '}
                -{' '}
                {new Date(analysis.period.end).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div className="text-zinc-400 text-sm mb-1">Total Transaksi</div>
              <div className="text-white font-semibold text-2xl">
                {analysis.total_transactions}
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div className="text-zinc-400 text-sm mb-1">Association Rules</div>
              <div className="text-white font-semibold text-2xl">{analysis.rules.length}</div>
            </div>
          </div>

          {/* Rules Table */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Association Rules
              </h3>
              <p className="text-zinc-400 text-sm mt-1">
                Pola pembelian produk berdasarkan algoritma Apriori
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#121212]">
                  <tr>
                    <th className="text-left px-6 py-4 text-zinc-400 font-semibold text-sm">
                      Jika Membeli
                    </th>
                    <th className="text-left px-6 py-4 text-zinc-400 font-semibold text-sm">
                      Maka Akan Membeli
                    </th>
                    <th className="text-left px-6 py-4 text-zinc-400 font-semibold text-sm">
                      Support
                    </th>
                    <th className="text-left px-6 py-4 text-zinc-400 font-semibold text-sm">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.rules.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-zinc-500">
                        Tidak ada association rules ditemukan dengan parameter yang dipilih
                      </td>
                    </tr>
                  ) : (
                    analysis.rules.map((rule, index) => (
                      <tr key={index} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                        <td className="px-6 py-4">
                          <div className="text-white font-medium">{rule.productA}</div>
                          <div className="text-zinc-500 text-xs font-mono mt-1">
                            ID: {rule.if_buy}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-medium">{rule.productB}</div>
                          <div className="text-zinc-500 text-xs font-mono mt-1">
                            ID: {rule.then_buy}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-blue-500 h-full"
                                style={{ width: `${rule.support * 100}%` }}
                              />
                            </div>
                            <span className="text-white text-sm font-semibold min-w-[50px]">
                              {(rule.support * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-green-500 h-full"
                                style={{ width: `${rule.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-white text-sm font-semibold min-w-[50px]">
                              {(rule.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insights */}
          {analysis.rules.length > 0 && (
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
              <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Insight
              </h4>
              <ul className="text-zinc-300 text-sm space-y-2">
                <li>
                  • Produk dengan confidence tertinggi:{' '}
                  <span className="text-white font-semibold">
                    {analysis.rules.reduce((max, rule) =>
                      rule.confidence > max.confidence ? rule : max
                    ).productA}{' '}
                    →{' '}
                    {analysis.rules.reduce((max, rule) =>
                      rule.confidence > max.confidence ? rule : max
                    ).productB}
                  </span>
                </li>
                <li>
                  • Rekomendasi: Tempatkan produk-produk dengan asosiasi tinggi berdekatan untuk
                  meningkatkan cross-selling
                </li>
                <li>
                  • Buat bundle promo untuk pasangan produk dengan confidence {'>'}= 80% untuk
                  meningkatkan nilai transaksi
                </li>
              </ul>
            </div>
          )}
        </div>
      )}

      {!analysis && !isLoading && (
        <div className="text-center py-12 text-zinc-500">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Atur parameter dan klik "Jalankan Analisis" untuk melihat hasil</p>
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
  const [formData, setFormData] = useState<Category>(
    category || { id: "", name: "", image: "", description: "", tag: "" },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Nama kategori wajib diisi!");
      return;
    }
    if (!formData.image) {
      toast.error("Gambar kategori wajib diupload!");
      return;
    }
    onSave(formData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const reader = new FileReader();
    reader.onloadend = () =>
      setFormData({ ...formData, image: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121212] border border-zinc-800 rounded-lg max-w-lg w-full">
        <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {category ? "Edit Kategori" : "Tambah Kategori"}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Nama Kategori*
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Gambar Kategori* (max 5MB)
            </label>
            {!formData.image ? (
              <label className="border-2 border-dashed border-zinc-700 rounded-lg p-6 cursor-pointer hover:border-zinc-600 transition-colors block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="text-center">
                  <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-2" />
                  <p className="text-white text-sm mb-1">
                    Upload Gambar Kategori
                  </p>
                  <p className="text-zinc-500 text-xs">
                    JPG, PNG, WEBP (max 5MB)
                  </p>
                </div>
              </label>
            ) : (
              <div className="relative">
                <Image
                  src={
                    formData.image.startsWith("data:image")
                      ? formData.image
                      : `${BASE_IMAGE_URL}/${formData.image}`
                  }
                  alt="Preview"
                  width={400}
                  height={400}
                  unoptimized
                  className="w-full h-48 object-cover rounded-lg border border-zinc-800"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image: "" })}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Deskripsi
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white h-24"
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Tag</label>
            <input
              type="text"
              value={formData.tag}
              onChange={(e) =>
                setFormData({ ...formData, tag: e.target.value })
              }
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white"
              placeholder="#hashtag"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-white text-black py-3 rounded-lg hover:bg-zinc-200 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Simpan
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 text-white py-3 rounded-lg hover:bg-zinc-700 transition-colors font-semibold"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
