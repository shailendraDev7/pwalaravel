import { create } from 'zustand';

type CartItem = {
  productId: number;
  variantId?: number;
  quantity: number;
  price: number;
  name: string;
  image_url: string; // URL of the product image
};

type CartState = {
  items: CartItem[];
  wishlist: number[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  addToWishlist: (productId: number) => void;
  removeFromWishlist: (productId: number) => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  wishlist: [],
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    })),
  addToWishlist: (productId) =>
    set((state) => ({
      wishlist: [...state.wishlist, productId],
    })),
  removeFromWishlist: (productId) =>
    set((state) => ({
      wishlist: state.wishlist.filter((id) => id !== productId),
    })),
}));