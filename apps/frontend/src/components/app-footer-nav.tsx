// src/components/app-footer-nav.tsx
'use client'; // This component needs client-side hooks

import { useCartStore } from '@/lib/store';
import Link from 'next/link';
import { useEffect } from 'react';
import { FaHome, FaShoppingCart, FaUser, FaEnvelope } from 'react-icons/fa';

export default function AppFooterNav() {
  const { cart, fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart(); // Fetch cart on component mount
  }, [fetchCart]);

  const cartItems = cart || []; // Fallback to empty array if cart is undefined

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-t-md z-20">
      <ul className="flex justify-around items-center h-16">
        <li>
          <Link href="/" className="flex flex-col items-center text-gray-600 hover:text-blue-500">
            <FaHome className="text-xl" />
            <span className="text-xs">Home</span>
          </Link>
        </li>
        <li>
          <Link href="/cart" className="flex flex-col items-center text-gray-600 hover:text-blue-500 relative">
            <FaShoppingCart className="text-xl" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
            <span className="text-xs">Cart</span>
          </Link>
        </li>
        <li>
          <Link href="/account" className="flex flex-col items-center text-gray-600 hover:text-blue-500">
            <FaUser className="text-xl" />
            <span className="text-xs">Account</span>
          </Link>
        </li>
        <li>
          <Link href="/messages" className="flex flex-col items-center text-gray-600 hover:text-blue-500">
            <FaEnvelope className="text-xl" />
            <span className="text-xs">Messages</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}