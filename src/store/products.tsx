import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { supabase } from '@/lib/supabase';

export type Product = {
  id: string;
  title: string;
  price: number;
  location: string;
  timeAgo: string;
  chatCount: number;
  likeCount: number;
  category?: string;
  imageUri?: string;
  userId?: string;
};

type DbRow = {
  id: string;
  title: string;
  price: number;
  location: string;
  category: string | null;
  image_uri: string | null;
  chat_count: number;
  like_count: number;
  created_at: string;
  user_id: string | null;
};

function calcTimeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

function rowToProduct(row: DbRow): Product {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    location: row.location,
    category: row.category ?? undefined,
    imageUri: row.image_uri ?? undefined,
    chatCount: row.chat_count,
    likeCount: row.like_count,
    timeAgo: calcTimeAgo(row.created_at),
    userId: row.user_id ?? undefined,
  };
}

type ProductsContextType = {
  userProducts: Product[];
  loading: boolean;
  addProduct: (p: Omit<Product, 'id' | 'chatCount' | 'likeCount' | 'timeAgo'>) => Promise<void>;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
};

const ProductsContext = createContext<ProductsContextType | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('전체');

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setUserProducts((data as DbRow[]).map(rowToProduct));
        }
        setLoading(false);
      });
  }, []);

  async function addProduct(p: Omit<Product, 'id' | 'chatCount' | 'likeCount' | 'timeAgo'>) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        title: p.title,
        price: p.price,
        location: p.location,
        category: p.category ?? null,
        image_uri: p.imageUri ?? null,
        user_id: p.userId ?? null,
      })
      .select()
      .single();

    if (!error && data) {
      setUserProducts((prev) => [rowToProduct(data as DbRow), ...prev]);
    }
  }

  return (
    <ProductsContext.Provider value={{ userProducts, loading, addProduct, selectedCategory, setSelectedCategory }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
