'use client';

import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';
import { getProducts as products } from "@/lib/products";
import Image from 'next/image';
import Link from 'next/link';

export default function WishlistPage() {
  const wishlist = useCartStore((state) => state.wishlist);
  const wishlistItems = products.filter((p) => wishlist.includes(p.id));

  return (
    <main className="container mx-auto p-4 lg:grid-cols-5">
      <h1 className="text-xl font-bold mb-4 md:text-2xl">Your Wishlist</h1>
      {wishlistItems.length === 0 ? (
        <p className="text-gray-500">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {wishlistItems.map((item) => (
            <div key={item.id} className="border rounded-md bg-white overflow-hidden">
              <Link href={`/product/${item.id}`}>
                <div className="relative w-full h-32">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>
              <div className="p-2">
                <h2 className="text-sm font-semibold truncate">{item.name}</h2>
                <p className="text-xs text-gray-600">NPR {item.base_price}</p>
                <div className="flex gap-1 mt-2">
                  <Link href={`/product/${item.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      View
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="text-xs"
                    onClick={() =>
                      useCartStore.getState().addItem({
                        productId: item.id,
                        quantity: 1,
                        price: item.base_price,
                        name: item.name,
                        image_url: item.image_url,
                      })
                    }
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}