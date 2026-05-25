'use client';

import { ProfileSidebar } from '../../components/layout/ProfileSidebar';
import { useCart } from '../../context/CartContext';
import { Package, Clock, Copy, AlertCircle, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { clientFetch } from '@/lib/apiFetch';
import { BASE_IMAGE_URL } from '@/app/components/base-api';
import { toast } from 'sonner';

export default function OrderHistory() {
  const [dataOrders, setDataOrders] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState<string>("all");
  
  // State untuk kontrol Modal Cancel Order konsumen
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedOrderIdToCancel, setSelectedOrderIdToCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const orderStatuses = [
    { id: "all", label: "Semua" },
    { id: "pending", label: "Belum Bayar" },
    { id: "waiting_verification", label: "Diverifikasi" },
    { id: "processing", label: "Diproses" },
    { id: "shipped", label: "Dikirim" },
    { id: "delivered", label: "Sampai" },
    { id: "success", label: "Selesai" },
    { id: "cancelled", label: "Dibatalkan" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting_verification':
        return 'bg-orange-950/50 text-orange-400 border border-orange-900';
      case 'success':
        return 'bg-emerald-950/50 text-emerald-400 border border-emerald-900';
      case 'pending':
        return 'bg-yellow-950/40 text-yellow-400 border border-yellow-900';
      case 'processing':
        return 'bg-blue-950/40 text-blue-400 border border-blue-900';
      case 'shipped':
        return 'bg-purple-950/40 text-purple-400 border border-purple-900';
      case 'delivered':
        return 'bg-green-950/40 text-green-400 border border-green-900';
      case 'cancelled':
        return 'bg-red-950/40 text-red-400 border border-red-900';
      default:
        return 'bg-zinc-900/30 text-zinc-400 border border-zinc-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Pesanan Selesai';
      case 'pending':
        return 'Menunggu Pembayaran';
      case 'waiting_verification':
        return 'Menunggu Verifikasi';
      case 'processing':
        return 'Sedang Diproses';
      case 'shipped':
        return 'Dalam Pengiriman';
      case 'delivered':
        return 'Sudah Sampai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await clientFetch("/orders");
      if (res?.data) {
        setDataOrders(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCopyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Kode order berhasil disalin!");
  };

  // Handler eksekusi pembatalan dari sisi user konsumen
  const handleCancelOrderSubmit = async () => {
    if (!selectedOrderIdToCancel || !cancelReason.trim()) {
      toast.error("Alasan pembatalan wajib diisi!");
      return;
    }

    try {
      await clientFetch(`/orders/${selectedOrderIdToCancel}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "cancelled",
          notes: `Dibatalkan oleh Konsumen. Alasan: ${cancelReason}` // Menyimpan alasan pembatalan konsumen ke field notes
        }),
      });

      toast.success("Pesanan Anda berhasil dibatalkan!");
      setIsCancelModalOpen(false);
      setSelectedOrderIdToCancel(null);
      setCancelReason("");
      fetchOrders(); // Refresh data tampilan terbaru
    } catch (error) {
      toast.error("Gagal membatalkan pesanan, silakan hubungi CS.");
    }
  };

  // Filter data orders berdasarkan tab marketplace yang sedang aktif
  const filteredOrders = currentTab === "all"
    ? dataOrders
    : dataOrders?.filter((order: any) => order.status === currentTab);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Akun Saya</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <ProfileSidebar />

        <div className="lg:col-span-3 space-y-4">
          {/* Marketplace Navigation Tabs */}
          <div className="flex border-b border-zinc-800 bg-[#121212] rounded-t-lg overflow-x-auto scrollbar-none">
            {orderStatuses.map((tab) => {
              const count = tab.id === "all" ? dataOrders?.length : dataOrders?.filter((o: any) => o.status === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`px-5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
                    currentTab === tab.id
                      ? "border-blue-500 text-blue-400 bg-zinc-900/20"
                      : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    currentTab === tab.id ? "bg-blue-950 text-blue-300" : "bg-zinc-800 text-zinc-500"
                  }`}>
                    {count || 0}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-[#121212] border-x border-b border-zinc-800 rounded-b-lg p-6">
            {filteredOrders?.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400 mb-2">Tidak ada pesanan</p>
                <p className="text-zinc-500 text-xs">
                  Pesanan dalam kategori status ini tidak ditemukan
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders?.map((order: any) => (
                  <div
                    key={order.id}
                    className="border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors bg-[#141414]"
                  >
                    {/* Header baris pesanan */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/60 pb-4 mb-4 gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-white font-mono text-sm font-semibold tracking-wide">
                            Order #{order.orderCode}
                          </h3>
                          <button
                            onClick={() => handleCopyToClipboard(order.orderCode)}
                            className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded transition-colors"
                            title="Salin Kode Order"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-zinc-600" />
                        <span>
                          {format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', { locale: id })}
                        </span>
                      </div>
                    </div>

                    {/* Informasi Item Produk */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <Image
                          src={`${BASE_IMAGE_URL}/${order.product?.image}`}
                          alt={order.product?.name || "Produk"}
                          width={400}
                          height={400}
                          unoptimized
                          className="w-14 h-20 object-cover rounded-lg bg-zinc-900 border border-zinc-800"
                        />
                        <div className="space-y-1">
                          <p className="text-white text-sm font-semibold tracking-wide">{order.product?.name}</p>
                          <p className="text-zinc-500 text-xs font-medium">
                            Ukuran Varian: <span className="text-zinc-300 uppercase">{order.size}</span>
                          </p>
                          <p className="text-zinc-500 text-xs font-medium">
                            Jumlah Barang: <span className="text-zinc-300 font-bold font-mono">{order.qty || 1}x</span>
                          </p>
                        </div>
                      </div>

                      {/* Detail Finansial & Tombol Aksi Cancel */}
                      <div className="w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-3 border-t sm:border-t-0 border-zinc-800/40 pt-3 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Total Belanja</p>
                          <p className="text-blue-400 font-bold text-base font-mono">
                            Rp {parseInt(order.totalAmount).toLocaleString('id-ID')}
                          </p>
                        </div>

                        {/* Opsi Pembatalan Mandiri oleh Konsumen (Hanya tampil jika status belum diproses admin) */}
                        {(order.status === 'pending' || order.status === 'waiting_verification') && (
                          <button
                            onClick={() => {
                              setSelectedOrderIdToCancel(order.id);
                              setIsCancelModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/30 border border-red-900/60 rounded-lg text-red-400 text-xs font-bold transition-all"
                          >
                            Batalkan Pesanan
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Jika pesanan memiliki catatan pembatalan/alasan dari admin, tampilkan di bawahnya */}
                    {order.status === 'cancelled' && order.notes && (
                      <div className="mt-4 p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-xs text-zinc-400 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <span className="italic">Note Sistem: {order.notes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── MODAL FORM CANCEL CONSUMER ─── */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between bg-[#161616]">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" /> Ajukan Pembatalan Pesanan
              </h2>
              <button
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setSelectedOrderIdToCancel(null);
                  setCancelReason("");
                }}
                className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Apakah Anda yakin ingin membatalkan pesanan ini? Mohon tuliskan alasan pembatalan Anda di bawah ini agar kami dapat memproses pembatalan dengan valid.
              </p>
              
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Alasan Anda*</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Contoh: Ingin mengubah varian produk / Salah memasukkan rincian pesanan..."
                  className="w-full bg-[#121212] border border-zinc-800 rounded-lg p-3 text-xs text-white h-24 focus:outline-none focus:border-zinc-700 resize-none placeholder:text-zinc-600"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancelOrderSubmit}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Konfirmasi Batalkan
                </button>
                <button
                  onClick={() => {
                    setIsCancelModalOpen(false);
                    setSelectedOrderIdToCancel(null);
                    setCancelReason("");
                  }}
                  className="flex-1 bg-zinc-800 text-zinc-300 py-2 rounded-lg hover:bg-zinc-700 transition-colors font-semibold text-xs"
                >
                  Kembali
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}