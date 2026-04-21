import React from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="w-24 h-24 text-zinc-700 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Keranjang Belanja Kosong
          </h2>
          <p className="text-zinc-400 mb-8">
            Belum ada produk di keranjang. Yuk mulai belanja!
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-black px-8 py-3 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Belanja Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Keranjang Belanja</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.product.id}-${item.size}-${item.color}`}
              className="bg-[#121212] border border-zinc-800 rounded-lg p-4"
            >
              <div className="flex gap-4">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-24 h-32 object-cover rounded-lg"
                />

                <div className="flex-grow">
                  <h3 className="text-white font-semibold mb-1">
                    {item.product.name}
                  </h3>
                  <p className="text-zinc-400 text-sm mb-1">
                    Ukuran: {item.size}
                  </p>
                  {item.color && item.color !== '-' && (
                    <p className="text-zinc-400 text-sm mb-2">
                      Warna: {item.color}
                    </p>
                  )}
                  <p className="text-white mb-3">
                    Rp {(item.product.discount_price
                      ? parseFloat(item.product.discount_price)
                      : parseFloat(item.product.base_price)
                    ).toLocaleString('id-ID')}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)
                        }
                        className="w-8 h-8 rounded bg-zinc-800 text-white hover:bg-zinc-700 transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)
                        }
                        className="w-8 h-8 rounded bg-zinc-800 text-white hover:bg-zinc-700 transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6">Ringkasan Belanja</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>Rp {getTotalPrice().toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Ongkos Kirim</span>
                <span>Gratis</span>
              </div>
              <div className="border-t border-zinc-800 pt-3 flex justify-between text-white">
                <span className="font-semibold">Total</span>
                <span className="font-bold">
                  Rp {getTotalPrice().toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-white text-black py-3 rounded-lg hover:bg-zinc-200 transition-colors font-semibold"
            >
              Lanjut ke Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
