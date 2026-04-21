import axios from "axios";
import { BASE_API_URI } from "../components/base-api";

export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  tag: string;
}

export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const response = await axios.get(`${BASE_API_URI}/categories`);
    return response.data.data || [];
  } catch (error) {
    console.error("Gagal ambil produk dari API:", error);
    return [];
  }
};

// export const categories: Category[] = [
//   {
//     id: 'cat-001',
//     name: 'Kemeja',
//     image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=300&fit=crop',
//     description: 'Kemeja thrift pilihan terbaik dari Mahen Store. Koleksi kemeja berkualitas dengan harga terjangkau.',
//     tag: '#kemeja-thrift',
//   },
//   {
//     id: 'cat-002',
//     name: 'Celana',
//     image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=300&fit=crop',
//     description: 'Celana jeans dan chino pilihan terbaik. Berbagai model dari skinny hingga regular fit.',
//     tag: '#celana-thrift',
//   },
//   {
//     id: 'cat-003',
//     name: 'Jaket',
//     image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop',
//     description: 'Jaket thrift berkualitas tinggi. Dari bomber hingga denim jacket dengan karakter unik.',
//     tag: '#jaket-thrift',
//   },
//   {
//     id: 'cat-004',
//     name: 'Kaos',
//     image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
//     description: 'Kaos vintage dan band tee pilihan. Koleksi kaos unik dengan desain menarik.',
//     tag: '#kaos-vintage',
//   },
//   {
//     id: 'cat-005',
//     name: 'Sweater',
//     image: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=400&h=300&fit=crop',
//     description: 'Sweater dan hoodie hangat untuk segala cuaca. Koleksi sweater vintage berkualitas.',
//     tag: '#sweater-thrift',
//   },
//   {
//     id: 'cat-006',
//     name: 'Aksesoris',
//     image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
//     description: 'Aksesoris fashion untuk melengkapi gaya Anda. Dari topi hingga tas vintage.',
//     tag: '#aksesoris-vintage',
//   },
// ];
