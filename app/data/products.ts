import axios from 'axios';
import { BASE_API_URI } from '../components/base-api'; 

export interface Product {
  id: string;
  name: string;
  code: string;
  image: string;
  images: string[];
  description: string;
  base_price: string;
  discount_price?: string;
  stock: number;
  size: string[];
  color: string[];
  weight: string[];
  category: {
    id: string;
    name: string;
  };
  featured?: boolean;
}

// 1. Fungsi helper utama untuk ambil data dari API
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const response = await axios.get(`${BASE_API_URI}/products`);
    return response.data.data || [];
  } catch (error) {
    console.error("Gagal ambil produk dari API:", error);
    return [];
  }
};

// 2. Ambil produk berdasarkan ID (Langsung tembak endpoint spesifik)
export const getProductById = async (id: string): Promise<Product | undefined> => {
  try {
    const response = await axios.get(`${BASE_API_URI}/products/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Gagal ambil produk ID ${id}:`, error);
    return undefined;
  }
};

// 3. Ambil produk berdasarkan kategori
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const products = await getAllProducts();
  return products.filter(
    (product) => product.category.name.toLowerCase() === category.toLowerCase()
  );
};

// 4. Ambil produk yang di-featured
export const getFeaturedProducts = async (): Promise<Product[]> => {
  const products = await getAllProducts();
  return products.filter((product) => product.featured);
};

// 5. Ambil produk secara acak (Random)
export const getRandomProducts = async (count: number): Promise<Product[]> => {
  const products = await getAllProducts();
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// 6. Fungsi Search
export const searchProducts = async (query: string): Promise<Product[]> => {
  const products = await getAllProducts();
  const searchLower = query.toLowerCase().trim();
  if (!searchLower) return products;

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      product.category.name.toLowerCase().includes(searchLower)
  );
};