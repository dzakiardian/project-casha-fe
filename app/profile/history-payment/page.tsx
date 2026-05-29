"use client";

import React, { useEffect, useState } from "react";
import { ProfileSidebar } from "../../components/layout/ProfileSidebar";
import { CreditCard, Clock, Copy, AlertCircle, Eye, Package } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Image from "next/image";
import { clientFetch } from "@/lib/apiFetch";
import { BASE_IMAGE_URL } from "@/app/components/base-api";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";

export default function Page() {
  const [dataPayments, setDataPayments] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState<string>("all");
  
  // State untuk melihat preview detail foto bukti transfer besar
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Mahen Store - Histori Pembayaran Saya";
    fetchPayments();
  }, []);

  const paymentStatuses = [
    { id: "all", label: "Semua Bukti" },
    { id: "pending", label: "Menunggu Verifikasi" },
    { id: "approveed", label: "Diterima" },
    { id: "rejected", label: "Ditolak" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-950/40 text-orange-400 border border-orange-900/60";
      case "approveed":
        return "bg-emerald-950/50 text-emerald-400 border border-emerald-900";
      case "rejected":
        return "bg-red-950/40 text-red-400 border border-red-900";
      default:
        return "bg-zinc-900/30 text-zinc-400 border border-zinc-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Menunggu Konfirmasi";
      case "approveed":
        return "Pembayaran Sah / Terverifikasi";
      case "rejected":
        return "Bukti Transfer Ditolak";
      default:
        return status;
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await clientFetch("/payments");
      if (res?.data && Array.isArray(res.data)) {
        setDataPayments(res.data);
      }
    } catch (error) {
      console.log("Gagal memuat riwayat transaksi payments:", error);
    }
  };

  const handleCopyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Kode order berhasil disalin!");
  };

  // Filter data payments berdasarkan tab filter active
  const filteredPayments = currentTab === "all"
    ? dataPayments
    : dataPayments?.filter((pay: any) => pay.status === currentTab);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Akun Saya</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <ProfileSidebar />

        <div className="lg:col-span-3 space-y-4">
          
          {/* Navigation Filter Tabs Kontrol Keuangan */}
          <div className="flex border-b border-zinc-800 bg-[#121212] rounded-t-lg overflow-x-auto scrollbar-none">
            {paymentStatuses.map((tab) => {
              const count = tab.id === "all" ? dataPayments?.length : dataPayments?.filter((p: any) => p.status === tab.id).length;
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

          {/* Area Konten Bukti Pembayaran */}
          <div className="bg-[#121212] border-x border-b border-zinc-800 rounded-b-lg p-6">
            {filteredPayments?.length === 0 ? (
              <div className="text-center py-16">
                <CreditCard className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400 mb-2">Belum ada transaksi pembayaran</p>
                <p className="text-zinc-500 text-xs">
                  Riwayat unggahan bukti transfer dalam kategori ini kosong
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPayments?.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors bg-[#141414] flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                  >
                    
                    {/* Sisi Kiri: Info Transaksi & Tanggal Upload */}
                    <div className="space-y-3 flex-grow">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-white font-mono text-sm font-semibold tracking-wide">
                            Order #{payment.orderCode}
                          </h3>
                          <button
                            onClick={() => handleCopyToClipboard(payment.orderCode)}
                            className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded transition-colors"
                            title="Salin Kode Order"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${getStatusColor(payment.status)}`}>
                          {getStatusText(payment.status)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                        <Clock className="w-3.5 h-3.5 text-zinc-600" />
                        <span>Diunggah pada:</span>
                        <span className="text-zinc-300">
                          {payment.uploadedAt ? format(new Date(payment.uploadedAt), "dd MMMM yyyy, HH:mm", { locale: id }) : "-"}
                        </span>
                      </div>

                      {/* Info Tambahan dari Finance / Alasan Penolakan Bukti */}
                      {payment.notes && (
                        <div className="p-3 bg-zinc-900 border border-zinc-800/80 rounded-lg text-xs text-zinc-400 flex items-start gap-2 max-w-xl">
                          <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                          <span><strong className="text-zinc-300">Memo Admin:</strong> {payment.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Sisi Kanan: Thumbnail Bukti Gambar Slip Transfer */}
                    <div className="relative group shrink-0 w-full md:w-auto flex justify-start md:justify-end border-t md:border-t-0 border-zinc-800/50 pt-4 md:pt-0">
                      <div 
                        onClick={() => setPreviewImage(`${BASE_IMAGE_URL}/${payment.photoUrl}`)}
                        className="relative w-16 h-20 md:w-20 md:h-24 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden cursor-zoom-in hover:border-zinc-500 transition-all shadow-md group"
                      >
                        <Image
                          src={`${BASE_IMAGE_URL}/${payment.photoUrl}`}
                          alt={`Bukti Transfer ${payment.orderCode}`}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
            <Button onClick={() => document.location.href = '/pembayaran'} className="w-full bg-slate-200/80 text-slate-900 font-semibold hover:bg-slate-400 cursor-pointer mt-5">Lihat semua pembayaranmu disini</Button>
          </div>
        </div>
      </div>

      {/* ─── MODAL POPUP LIGHTBOX PREVIEW BUKTI TRANSFER ─── */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-md cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-lg w-full h-[75vh] md:h-[80vh] flex flex-col justify-center animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-zinc-400 hover:text-white font-semibold text-xs bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              Tutup Preview (Esc)
            </button>
            <div className="relative w-full h-full border border-zinc-800 rounded-xl overflow-hidden shadow-2xl bg-[#141414]">
              <Image
                src={previewImage}
                alt="Pratinjau Bukti Transfer Pembayaran Sah"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}