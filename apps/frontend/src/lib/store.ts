// src/lib/store.ts
import { create } from "zustand";
import { supabase } from "./supabase";

interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  fetchCart: () => Promise<void>;
  addToCart: (
    productId: string,
    variantId?: string,
    quantity?: number
  ) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  createOrder: (address: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  fetchCart: async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data, error } = await supabase
      .from("carts")
      .select("cart_items(*, product:products(name, base_price, product_img))")
      .eq("user_id", user.user.id)
      .single();
    if (error) console.error(error);
    if (data?.cart_items) set({ cart: data.cart_items });
  },
  addToCart: async (productId, variantId, quantity = 1) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    let { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.user.id)
      .single();
    if (!cart) {
      const { data: newCart } = await supabase
        .from("carts")
        .insert([{ user_id: user.user.id }])
        .select()
        .single();
      cart = newCart;
    }
    const { data, error } = await supabase
      .from("cart_items")
      .insert([
        {
          cart_id: cart.id,
          product_id: productId,
          variant_id: variantId,
          quantity,
        },
      ])
      .select();
    if (error) console.error(error);
    if (data) set({ cart: [...get().cart, data[0]] });
  },
  removeFromCart: async (id) => {
    const { error } = await supabase.from("cart_items").delete().eq("id", id);
    if (error) console.error(error);
    set({ cart: get().cart.filter((item) => item.id !== id) });
  },
  createOrder: async (address: string) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const cart = get().cart;
    if (!cart.length) return;

    const { data: cartData } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.user.id)
      .single();

    const items = await Promise.all(
      cart.map(async (item) => {
        const { data: product } = await supabase
          .from("products")
          .select("base_price, vendor_id")
          .eq("id", item.product_id)
          .single();
        const { data: variant } = item.variant_id
          ? await supabase
              .from("product_variants")
              .select("price_adjustment")
              .eq("id", item.variant_id)
              .single()
          : { price_adjustment: 0 };
        return {
          product_id: item.product_id,
          vendor_id: product.vendor_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: product.base_price + (variant?.price_adjustment || 0),
        };
      })
    );

    const vendorIds = [...new Set(items.map((item) => item.vendor_id))];

    for (const vendorId of vendorIds) {
      const vendorItems = items.filter((item) => item.vendor_id === vendorId);
      const vendorTotal = vendorItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const { data: order } = await supabase
        .from("orders")
        .insert([
          {
            customer_id: user.user.id,
            vendor_id: vendorId,
            status: "pending",
            total: vendorTotal,
          },
        ])
        .select()
        .single();

      await supabase.from("order_details").insert(
        vendorItems.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price,
          address,
        }))
      );
    }

    await supabase.from("cart_items").delete().eq("cart_id", cartData.id);
    set({ cart: [] });
  },
}));