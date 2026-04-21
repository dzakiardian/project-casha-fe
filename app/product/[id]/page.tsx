"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById } from "../../data/products";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { ShoppingCart, Truck, Shield, ArrowLeft, Loader2, Box } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { BASE_API_URI, BASE_IMAGE_URL } from "@/app/components/base-api";
import { ProductRecomendationCard } from "./components/product-recomendation-card";
import axios from "axios";
import { clientFetch } from "@/lib/apiFetch";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // State Utama
  const [product, setProduct] = useState<any>(null);
  const [productRecomendations, setProductRecomendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State UI
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await getProductById(id);
        if (data) {
          setProduct(data?.product);
          setProductRecomendations(data?.recommendations)
          setSelectedImage(data?.product.image); 
        }
      } catch (error) {
        console.error("Gagal ambil produk:", error);
        toast.error("Gagal memuat detail produk");
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  console.log(productRecomendations, 'i')

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-zinc-500" />
        <p className="animate-pulse">Sedang memuat detail produk...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl text-white mb-4">Produk tidak ditemukan</h2>
        <button
          onClick={() => router.back()}
          className="text-zinc-400 hover:text-white flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Home
        </button>
      </div>
    );
  }

  const basePrice = parseFloat(product.base_price || "0");
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  const discount = discountPrice ? Math.round(((basePrice - discountPrice) / basePrice) * 100) : 0;
  const currentPrice = discountPrice || basePrice;
  const additionalImages = Array.isArray(product.images) ? product.images : [];
  const allImages = [product.image, ...additionalImages].filter(Boolean);

  // --- HANDLER FUNCTIONS ---
  const handleAddToCart = async () => {
    if (!isAuthenticatedCheck()) return;
    if (!selectionCheck()) return;

    const payloadDataCart = {
      productId: product.id,
      qty: quantity,
      size: selectedSize,
      color: selectedColor,
    }

    try {
      await clientFetch('/carts', {
        method: 'POST',
        body: JSON.stringify(payloadDataCart),
      });

      setSelectedColor("");
      setSelectedSize("");
      toast.success("Produk berhasil ditambahkan ke keranjang");
    } catch (error) {
      console.log(error);
      toast.error("Maaf sistem tidak dapat melayani pesanan anda untuk saat ini.")
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticatedCheck()) return;
    if (!selectionCheck()) return;

    const payloadDataCart = {
      productId: product.id,
      qty: quantity,
      size: selectedSize,
      color: selectedColor,
    }

    try {
      await clientFetch('/carts', {
        method: 'POST',
        body: JSON.stringify(payloadDataCart),
      });

      setSelectedColor("");
      setSelectedSize("");
      toast.success("Produk berhasil ditambahkan ke keranjang");
      router.push("/checkout");
    } catch (error) {
      console.log(error);
      toast.error("Maaf sistem tidak dapat melayani pesanan anda untuk saat ini.")
    }
  };

  const isAuthenticatedCheck = () => {
    if (!isAuthenticated) {
      toast.error("Silakan login terlebih dahulu");
      router.push("/login");
      return false;
    }
    return true;
  };

  const selectionCheck = () => {
    if (!selectedSize) {
      toast.error("Pilih ukuran terlebih dahulu");
      return false;
    }
    if (product.color?.length > 0 && !selectedColor) {
      toast.error("Pilih warna terlebih dahulu");
      return false;
    }
    return true;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-5 h-5" /> Kembali
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Kolom Kiri: Galeri Foto */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative w-full h-[500px] rounded-lg overflow-hidden bg-zinc-900 mb-4">
            {selectedImage && (
              <Image
                src={`${BASE_IMAGE_URL}/${selectedImage}`}
                alt={product?.name || "Picture"}
                fill
                quality={95}
                unoptimized
                className="object-cover"
                priority
              />
            )}
            {discount > 0 && (
              <div className="absolute top-4 right-4 bg-white text-black px-4 py-2 rounded-full font-bold">
                -{discount}%
              </div>
            )}
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {allImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(img)}
                className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === img ? "border-white" : "border-zinc-800"
                }`}
              >
                <Image src={`${BASE_IMAGE_URL}/${img}`} fill alt="thumbnail" unoptimized className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Detail & Aksi */}
        <div>
          <p className="text-zinc-400 uppercase text-xs tracking-widest mb-2">
            {product.category?.name || "Kategori"}
          </p>
          <h1 className="text-4xl font-bold text-white mb-2">{product.name}</h1>
          <p className="text-zinc-500 text-sm mb-6">SKU: {product.code}</p>

          <div className="flex items-center gap-4 mb-8">
            <span className="text-3xl font-bold text-white">
              Rp {currentPrice.toLocaleString("id-ID")}
            </span>
            {discountPrice && (
              <span className="text-xl text-zinc-500 line-through">
                Rp {basePrice.toLocaleString("id-ID")}
              </span>
            )}
          </div>

          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4 text-sm text-zinc-300">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Kualitas Terjamin</span>
              </div>
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4" />
                <span>Stok: {product.stock}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>Garansi pengiriman</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Deskripsi</h3>
            <p className="text-zinc-400 leading-relaxed">{product.description}</p>
          </div>

          {/* Pilihan Ukuran */}
          <div className="mb-8">
            <h3 className="text-white font-medium mb-4">Ukuran</h3>
            <div className="flex gap-3 flex-wrap">
              {product.size?.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[60px] h-12 rounded-lg border font-medium transition-all ${
                    selectedSize === size
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Pilihan Warna */}
          {product.color?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-white font-medium mb-4">Warna</h3>
              <div className="flex gap-3">
                {product.color.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                      selectedColor === color
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-zinc-400 border-zinc-800"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Jumlah</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
              >
                -
              </button>
              <span className="text-white w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-10 h-10 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-4 mt-10">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-3 bg-zinc-900 text-white h-14 rounded-xl hover:bg-zinc-800 transition-all border border-zinc-700"
            >
              <ShoppingCart size={20} /> Keranjang
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-white text-black font-bold h-14 rounded-xl hover:bg-zinc-200 transition-all"
            >
              Beli Sekarang
            </button>
          </div>
        </div>
      </div>
      <ProductRecomendationCard dataProduct={productRecomendations} />
    </div>
  );
}