import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const data = await AsyncStorage.getItem('@desafio8:product');

      if (data) {
        setProducts(JSON.parse(data));
      }
      console.log(products);
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function saveProductsChange(): Promise<void> {
      await AsyncStorage.setItem('@desafio8:product', JSON.stringify(products));
    }

    saveProductsChange();
  }, [products]);

  const increment = useCallback(
    async id => {
      const productId = products.findIndex(prod => prod.id === id);

      if (productId < 0) throw new Error('Você ainda não adicionou o produto');

      const updateProduct = [...products];
      updateProduct[productId].quantity += 1;
      setProducts(updateProduct);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productId = products.findIndex(prod => prod.id === id);

      if (productId < 0) throw new Error('Você ainda não adicionou o produto');

      const updateProduct = [...products];
      updateProduct[productId].quantity -= 1;

      if (updateProduct[productId].quantity <= 0) {
        updateProduct.splice(productId, 1);
      }

      setProducts(updateProduct);
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const productId = products.findIndex(prod => prod.id === product.id);

      if (productId >= 0) {
        increment(product.id);
      } else {
        const newProd = { ...product, quantity: 1 };
        setProducts(oldProd => [...oldProd, newProd]);
      }
    },
    [increment, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
