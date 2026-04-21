import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, checkout } = useCart();
  const { user } = useAuth();

  const defaultAddress = user?.addresses.find((addr) => addr.isDefault);

  const [selectedAddress, setSelectedAddress] = useState(
    defaultAddress || user?.addresses[0]
  );

  const handleCheckout = () => {
    if (!selectedAddress) {
      toast.error('Pilih alamat pengiriman terlebih dahulu');
      return;
    }

    checkout({
      recipientName: selectedAddress.recipientName,
      phone: selectedAddress.phone,
      fullAddress: selectedAddress.fullAddress,
      city: selectedAddress.city,
      postalCode: selectedAddress.postalCode,
    });

    toast.success('Pesanan berhasil dibuat!');
    navigate('/profile/orders');
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Alamat Pengiriman</h2>

            {user?.addresses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-400 mb-4">Belum ada alamat tersimpan</p>
                <button
                  onClick={() => navigate('/profile/address')}
                  className="bg-white text-black px-6 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Tambah Alamat
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {user?.addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`block border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedAddress?.id === address.id
                        ? 'border-white bg-zinc-900'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress?.id === address.id}
                      onChange={() => setSelectedAddress(address)}
                      className="hidden"
                    />
                    <div>
                      <p className="text-white font-semibold mb-1">
                        {address.label}
                        {address.isDefault && (
                          <span className="ml-2 text-xs bg-zinc-700 px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-zinc-400 text-sm mb-1">
                        {address.recipientName} | {address.phone}
                      </p>
                      <p className="text-zinc-400 text-sm">
                        {address.fullAddress}, {address.city}, {address.postalCode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Produk Pesanan</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="flex gap-4 pb-4 border-b border-zinc-800 last:border-0"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover rounded"
                  />
                  <div className="flex-grow">
                    <h3 className="text-white font-semibold mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-zinc-400 text-sm mb-1">
                      Ukuran: {item.size}
                      {item.color && item.color !== '-' && ` | Warna: ${item.color}`}
                      {' | Qty: '}{item.quantity}
                    </p>
                    <p className="text-white">
                      Rp {((item.product.discount_price
                        ? parseFloat(item.product.discount_price)
                        : parseFloat(item.product.base_price)
                      ) * item.quantity).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6">Ringkasan Pembayaran</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>Rp {getTotalPrice().toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Ongkos Kirim</span>
                <span>Gratis</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Biaya Admin</span>
                <span>Gratis</span>
              </div>
              <div className="border-t border-zinc-800 pt-3 flex justify-between text-white">
                <span className="font-semibold">Total Pembayaran</span>
                <span className="font-bold text-xl">
                  Rp {getTotalPrice().toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={!selectedAddress}
              className="w-full bg-white text-black py-3 rounded-lg hover:bg-zinc-200 transition-colors font-semibold disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed"
            >
              Bayar Sekarang
            </button>

            <p className="text-zinc-500 text-xs text-center mt-4">
              Dengan melakukan pembayaran, Anda menyetujui syarat dan ketentuan kami
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
