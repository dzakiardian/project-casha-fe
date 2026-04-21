export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
}

export const banners: Banner[] = [
  {
    id: '1',
    title: 'Koleksi Thrift Terbaru',
    subtitle: 'Temukan gaya unikmu dengan harga terjangkau',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop',
    cta: 'Belanja Sekarang',
  },
  {
    id: '2',
    title: 'Diskon Hingga 50%',
    subtitle: 'Promo spesial untuk koleksi pilihan',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=1080&fit=crop',
    cta: 'Lihat Promo',
  },
  {
    id: '3',
    title: 'Vintage Collection',
    subtitle: 'Pakaian berkualitas dengan karakter',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop',
    cta: 'Jelajahi',
  },
];
