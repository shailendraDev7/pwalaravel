// frontend/src/app/account/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ExtendedUser as User, Order } from '@/types';

// Define interfaces based on markdown
interface User {
  id: string;
  email: string;
  // Add other user properties as needed
}

interface Order {
  id: string;
  total: number;
  status: string;
  order_details: {
    id: string;
    product: {
      name: string;
      product_img: string;
    };
  }[];
}

export default function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('customer');
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          router.push('/');
          return;
        }
        setUser(data.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        const { data: vendor } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', data.user.id)
          .single();
        setRole(vendor ? 'vendor' : profile?.role || 'customer');

        if (profile?.role === 'customer' || !vendor) {
          const { data: userOrders } = await supabase
            .from('orders')
            .select('*, order_details(*, product:products(name, product_img))')
            .eq('customer_id', data.user.id);
          setOrders(userOrders as Order[] || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/');
      }
    };

    fetchUserData();
  }, [router]);

  if (!user) return <div>Loading...</div>;

  return (
    <main className="container mx-auto p-4">
      <h1>Account</h1>
      <p>Email: {user.email}</p>
      <p>Role: {role}</p>
      {role === 'customer' && (
        <div>
          <h2>Your Orders</h2>
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="border p-4 mb-4">
                <p>Order ID: {order.id}</p>
                <p>Total: NPR {order.total}</p>
                <p>Status: {order.status}</p>
                {order.order_details && order.order_details.length > 0 && (
                  <div className="mt-2">
                    <h3>Order Details</h3>
                    {order.order_details.map((detail) => (
                      <div key={detail.id} className="ml-4">
                        <p>Product: {detail.product.name}</p>
                        {detail.product.product_img && (
                          <Image
                            src={detail.product.product_img}
                            alt={detail.product.name}
                            className="w-16 h-16 object-cover mt-1"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No orders found.</p>
          )}
        </div>
      )}
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.push('/');
        }}
        className="bg-red-500 text-white px-4 py-2 mt-4"
      >
        Logout
      </button>
    </main>
  );
}