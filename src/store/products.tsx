import { createContext, useContext, useState, ReactNode } from 'react';

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
};

type ProductsContextType = {
  userProducts: Product[];
  addProduct: (p: Omit<Product, 'id' | 'chatCount' | 'likeCount' | 'timeAgo'>) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
};

const ProductsContext = createContext<ProductsContextType | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');

  function addProduct(p: Omit<Product, 'id' | 'chatCount' | 'likeCount' | 'timeAgo'>) {
    const newProduct: Product = {
      ...p,
      id: String(Date.now()),
      chatCount: 0,
      likeCount: 0,
      timeAgo: '방금 전',
    };
    setUserProducts((prev) => [newProduct, ...prev]);
  }

  return (
    <ProductsContext.Provider value={{ userProducts, addProduct, selectedCategory, setSelectedCategory }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
