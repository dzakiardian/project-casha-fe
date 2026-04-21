import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getProductById } from '../data/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Truck, Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = id ? getProductById(id) : null;
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>(product?.image || '');

  // Set default selected image when product loads
  React.useEffect(() => {
    if (product && !selectedImage) {
      setSelectedImage(product.image);
    }
  }, [product, selectedImage]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl text-white mb-4">Produk tidak ditemukan</h2>
        <button
          onClick={() => navigate('/')}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          Kembali ke Home
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      toast.error('Pilih ukuran terlebih dahulu');
      return;
    }

    if (!selectedColor && product.color.length > 0) {
      toast.error('Pilih warna terlebih dahulu');
      return;
    }

    addToCart(product, selectedSize, selectedColor || product.color[0] || '-', quantity);
    toast.success('Produk berhasil ditambahkan ke keranjang');
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      toast.error('Pilih ukuran terlebih dahulu');
      return;
    }

    if (!selectedColor && product.color.length > 0) {
      toast.error('Pilih warna terlebih dahulu');
      return;
    }

    addToCart(product, selectedSize, selectedColor || product.color[0] || '-', quantity);
    navigate('/checkout');
  };

  const basePrice = parseFloat(product.base_price);
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  const discount = discountPrice
    ? Math.round(((basePrice - discountPrice) / basePrice) * 100)
    : 0;
  const currentPrice = discountPrice || basePrice;

  // Combine main image with additional images
  const allImages = [product.image, ...product.images];

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Kembali
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery - Fixed Size */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative w-full h-[500px] rounded-lg overflow-hidden bg-zinc-900 mb-4">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <div className="absolute top-4 right-4 bg-white text-black px-4 py-2 rounded-full font-semibold">
                -{discount}%
              </div>
            )}
          </div>

          {/* Thumbnails - Scrollable */}
          {allImages.length > 1 && (
            <div className="relative">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-900 border-2 transition-all ${
                      selectedImage === img
                        ? 'border-white'
                        : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="text-zinc-400 uppercase text-sm mb-2">{product.category.name}</p>
          <h1 className="text-4xl font-bold text-white mb-2">{product.name}</h1>
          <p className="text-zinc-500 text-sm mb-4">Kode: {product.code}</p>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl text-white">
              Rp {currentPrice.toLocaleString('id-ID')}
            </span>
            {discountPrice && (
              <span className="text-xl text-zinc-500 line-through">
                Rp {basePrice.toLocaleString('id-ID')}
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
                <Truck className="w-4 h-4" />
                <span>Stok: {product.stock}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Deskripsi</h3>
            <p className="text-zinc-400 leading-relaxed">{product.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Pilih Ukuran</h3>
            <div className="flex gap-3 flex-wrap">
              {product.size.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-6 py-3 rounded-lg border transition-colors ${
                    selectedSize === size
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-zinc-300 border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {product.color.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Pilih Warna</h3>
              <div className="flex gap-3 flex-wrap">
                {product.color.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-6 py-3 rounded-lg border transition-colors ${
                      selectedColor === color
                        ? 'bg-white text-black border-white'
                        : 'bg-transparent text-zinc-300 border-zinc-700 hover:border-zinc-500'
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

          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 text-white px-8 py-4 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Tambah ke Keranjang
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-white text-black px-8 py-4 rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Beli Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
