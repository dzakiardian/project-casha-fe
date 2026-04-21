"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { clientFetch } from "@/lib/apiFetch";

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
  const [address, setAddress] = useState<any>([])

  const fetchItems = async () => {
    try {
        const data = await clientFetch("/carts");
        setItems(data.data);
    } catch (error) {
        console.log(error);
    }
  }

  const fetchAddress = async () => {
    try {
        const data = await clientFetch("/address");
        const primaryAddress = data.data;
        setAddress(primaryAddress);
    } catch (error) {
        console.log(error);
    }
  }

  useEffect(() => {
    fetchItems();
    fetchAddress();
  }, []);
  return <CheckoutClient address={address} itemProducts={items} />;
}