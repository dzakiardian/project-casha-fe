"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { clientFetch } from "@/lib/apiFetch";
// ─── IMPORT USE SEARCHPARAMS BUAT BACA URL QUERY ───
import { useSearchParams } from "next/navigation"; 

const CheckoutClient = dynamic(() => import("../components/CheckoutClient"), {
  ssr: false,
  loading: () => (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    </div>
  ),
});

export default function CheckoutWrapper() {
  const [items, setItems] = useState<any>([]);
  const [address, setAddress] = useState<any>([]);
  
  // Ambil data query "?items=id1,id2" dari URL browser
  const searchParams = useSearchParams();
  const selectedItemsQuery = searchParams.get("items");

  const fetchItems = async () => {
    try {
      const data = await clientFetch("/carts");
      
      // Jika ada filter ID item dari halaman keranjang sebelumnya
      if (selectedItemsQuery && data.data) {
        // Pecah string "id1,id2" menjadi array ["id1", "id2"]
        const allowedIds = selectedItemsQuery.split(",");
        
        // Saring data: Hanya loloskan item keranjang yang ID-nya ada di dalam daftar centang
        const filteredItems = data.data.filter((cartItem: any) => 
          allowedIds.includes(cartItem.id)
        );
        
        setItems(filteredItems);
      } else {
        // Fallback: Kalau diakses langsung tanpa query, tampilkan semua (atau kosongi)
        setItems(data.data || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAddress = async () => {
    try {
      const data = await clientFetch("/address");
      const primaryAddress = data.data;
      setAddress(primaryAddress);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchAddress();
  }, [selectedItemsQuery]); // Re-fetch jika parameter URL mendadak berubah

  return <CheckoutClient address={address} itemProducts={items} />;
}