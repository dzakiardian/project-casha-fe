export default function About() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-6 text-center">
          Tentang Mahen Store
        </h1>
        <p className="text-zinc-400 text-center text-lg mb-12">
          Destinasi terpercaya untuk fashion thrifting berkualitas
        </p>

        <div className="bg-[#121212] border border-zinc-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Tentang Kami</h2>
          <div className="text-zinc-300 space-y-4">
            <p>
              Mahen Store adalah platform e-commerce yang berfokus pada penjualan pakaian
              thrifting berkualitas tinggi. Kami percaya bahwa fashion tidak harus mahal
              untuk terlihat stylish dan berkelas.
            </p>
            <p>
              Setiap produk yang kami jual telah melalui proses kurasi yang ketat untuk
              memastikan kualitas, kondisi, dan gaya yang sesuai dengan standar kami.
              Dari kemeja vintage hingga jaket kulit klasik, kami menawarkan berbagai
              pilihan yang cocok untuk berbagai gaya dan kesempatan.
            </p>
            <p>
              Dengan Mahen Store, Anda tidak hanya mendapatkan pakaian berkualitas dengan
              harga terjangkau, tetapi juga berkontribusi pada fashion yang lebih
              berkelanjutan dan ramah lingkungan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-white">500+</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Produk Tersedia</h3>
            <p className="text-zinc-400 text-sm">
              Koleksi thrift pilihan untuk gaya unik Anda
            </p>
          </div>

          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-white">1K+</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Pelanggan Puas</h3>
            <p className="text-zinc-400 text-sm">
              Dipercaya oleh ribuan fashion enthusiast
            </p>
          </div>

          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-white">100%</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Terjamin Kualitas</h3>
            <p className="text-zinc-400 text-sm">
              Setiap produk dikurasi dengan teliti
            </p>
          </div>
        </div>

        <div className="bg-[#121212] border border-zinc-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Mengapa Memilih Kami?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Kualitas Terjamin</h3>
                <p className="text-zinc-400 text-sm">
                  Setiap produk melalui quality control ketat
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Harga Terjangkau</h3>
                <p className="text-zinc-400 text-sm">
                  Fashion berkualitas dengan harga ramah kantong
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🌍</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Ramah Lingkungan</h3>
                <p className="text-zinc-400 text-sm">
                  Berkontribusi pada fashion berkelanjutan
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Pengiriman Cepat</h3>
                <p className="text-zinc-400 text-sm">
                  Proses pengiriman yang aman dan terpercaya
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
