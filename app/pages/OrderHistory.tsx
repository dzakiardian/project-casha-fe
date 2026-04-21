import React from 'react';
import { ProfileSidebar } from '../components/layout/ProfileSidebar';
import { useCart } from '../context/CartContext';
import { Package, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const OrderHistory: React.FC = () => {
  const { orders } = useCart();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-600';
      case 'processing':
        return 'bg-blue-600';
      case 'shipped':
        return 'bg-purple-600';
      case 'delivered':
        return 'bg-green-600';
      default:
        return 'bg-zinc-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Pembayaran';
      case 'processing':
        return 'Diproses';
      case 'shipped':
        return 'Dikirim';
      case 'delivered':
        return 'Selesai';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Akun Saya</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <ProfileSidebar />

        <div className="lg:col-span-3">
          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Histori Pesanan</h2>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400 mb-2">Belum ada pesanan</p>
                <p className="text-zinc-500 text-sm">
                  Pesanan yang telah dibuat akan muncul di sini
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold">
                            Order #{order.id}
                          </h3>
                          <span
                            className={`text-xs text-white px-3 py-1 rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Clock className="w-4 h-4" />
                          <span>
                            {format(new Date(order.date), 'dd MMMM yyyy, HH:mm', {
                              locale: id,
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-zinc-400 text-sm mb-1">Total Pembayaran</p>
                        <p className="text-white font-bold text-lg">
                          Rp {order.total.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-4">
                      <p className="text-sm text-zinc-400 mb-2">Produk:</p>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 text-sm"
                          >
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-12 h-16 object-cover rounded"
                            />
                            <div className="flex-grow">
                              <p className="text-white">{item.product.name}</p>
                              <p className="text-zinc-400">
                                {item.size} × {item.quantity}
                              </p>
                            </div>
                            <p className="text-white">
                              Rp{' '}
                              {(item.product.price * item.quantity).toLocaleString(
                                'id-ID'
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-4 mt-4">
                      <p className="text-sm text-zinc-400 mb-2">Alamat Pengiriman:</p>
                      <p className="text-white text-sm">
                        {order.shippingAddress.recipientName} |{' '}
                        {order.shippingAddress.phone}
                      </p>
                      <p className="text-zinc-400 text-sm">
                        {order.shippingAddress.fullAddress},{' '}
                        {order.shippingAddress.city},{' '}
                        {order.shippingAddress.postalCode}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
