import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../data/products';

interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  shippingAddress: {
    recipientName: string;
    phone: string;
    fullAddress: string;
    city: string;
    postalCode: string;
  };
}

interface CartContextType {
  items: CartItem[];
  orders: Order[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  checkout: (shippingAddress: Order['shippingAddress']) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    const storedOrders = localStorage.getItem('orders');
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const addToCart = (product: Product, size: string, color: string, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.product.id === product.id && item.size === size && item.color === color
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevItems, { product, size, color, quantity }];
    });
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setItems(prevItems =>
      prevItems.filter(item => !(item.product.id === productId && item.size === size && item.color === color))
    );
  };

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.product.discount_price
        ? parseFloat(item.product.discount_price)
        : parseFloat(item.product.base_price);
      return total + price * item.quantity;
    }, 0);
  };

  const checkout = (shippingAddress: Order['shippingAddress']) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: [...items],
      total: getTotalPrice(),
      status: 'pending',
      shippingAddress,
    };

    setOrders(prevOrders => [newOrder, ...prevOrders]);
    clearCart();
  };

  return (
    <CartContext.Provider
      value={{
        items,
        orders,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
