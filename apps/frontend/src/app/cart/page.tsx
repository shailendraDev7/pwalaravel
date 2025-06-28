'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function CartPage() {
  const { cart, fetchCart, removeFromCart, createOrder } = useCartStore();

  useEffect(() => {
    fetchCart(); // Fetch cart on mount
  }, [fetchCart]);

  // Calculate subtotal based on product base_price and variant price_adjustment
  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.product.base_price + (item.variant_id ? item.variant?.price_adjustment || 0 : 0);
    return sum + itemPrice * item.quantity;
  }, 0);

  // Clear cart by deleting all cart_items for the user's cart
  const handleClearCart = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data: cartData } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.user.id)
      .single();
    if (cartData) {
      const { error } = await supabase.from('cart_items').delete().eq('cart_id', cartData.id);
      if (error) {
        console.error('Error clearing cart:', error.message);
        alert('कार्ट खाली गर्न असफल'); // Nepali error
      } else {
        fetchCart(); // Refresh cart state
        alert('कार्ट खाली गरियो'); // Nepali success message
      }
    }
  };

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-120px)]">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">तपाईंको कार्ट</h1>

      {cart.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500 mb-4">तपाईंको कार्ट हाल खाली छ। अब किनमेल सुरु गर्नुहोस्!</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 text-lg font-semibold rounded hover:bg-blue-700 transition-colors"
          >
            उत्पादनहरू हेर्नुहोस्
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cart Items List */}
          <div className="md:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div
                key={`${item.product_id}-${item.variant_id || 'no-variant'}-${index}`}
                className="flex items-center gap-4 p-4 border rounded-lg bg-white shadow-sm"
              >
                <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
                  <Image
                    src={item.product.product_img || '/images/placeholder-product.png'}
                    alt={item.product.name}
                    fill
                    sizes="(max-width: 768px) 100px, 150px"
                    className="object-cover"
                    priority={index < 3} // Prioritize first 3 images for LCP
                  />
                </div>
                <div className="flex-grow">
                  <h2 className="text-base sm:text-lg font-semibold mb-1 text-gray-800">{item.product.name}</h2>
                  {item.variant_id && (
                    <p className="text-sm text-gray-600 mb-1">
                      {item.variant?.variant_name}: {item.variant?.variant_value}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mb-1">परिमाण: {item.quantity}</p>
                  <p className="text-md font-bold text-blue-700">
                    NPR {(item.product.base_price + (item.variant_id ? item.variant?.price_adjustment || 0 : 0)).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="px-3 py-1 text-sm font-medium bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  हटाउनुहोस्
                </button>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="md:col-span-1">
            <div className="shadow-lg rounded-lg bg-white p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">अर्डर सारांश</h2>
              <div className="flex justify-between items-center mb-3 text-lg">
                <span className="text-gray-700">उप-जम्मा:</span>
                <span className="font-bold text-gray-900">NPR {subtotal.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4 mt-4">
                <p className="text-xl font-extrabold text-green-700 flex justify-between items-center">
                  <span>जम्मा:</span>
                  <span>NPR {subtotal.toFixed(2)}</span>
                </p>
              </div>
              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={() => createOrder('Kathmandu, Nepal')} // Placeholder address; replace with form input
                  className="w-full py-3 text-lg font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  चेकआउटमा जानुहोस्
                </button>
                <button
                  onClick={handleClearCart}
                  className="w-full py-3 text-lg font-semibold border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                >
                  कार्ट खाली गर्नुहोस्
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}