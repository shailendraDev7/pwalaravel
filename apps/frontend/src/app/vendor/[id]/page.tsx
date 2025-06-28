"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getProducts as products } from "@/lib/products";
import { useCartStore } from "@/lib/store";

export default function VendorPage() {
  const { id } = useParams<{ id: string }>();
  const vendorId = parseInt(id);
  const vendors = [
    {
      id: 1,
      name: "Himalayan Crafts",
      avatar: "/images/vendor1.png",
      bio: "Handcrafted Nepali goods",
    },
    {
      id: 2,
      name: "Kathmandu Artisans",
      avatar: "/images/vendor2.png",
      bio: "Traditional artisans",
    },
  ];
  const vendor = vendors.find((v) => v.id === vendorId);
  const vendorProducts = products.filter((p) => p.vendor_id === vendorId);

  if (!vendor) {
    notFound();
  }

  return (
    <main className="lg:max-w-5xl lg:grid-cols-5 p-4">
      <div className="max-w-md mx-auto md:max-w-3xl lg:max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16">
            <Image
              src={vendor.avatar}
              alt={vendor.name}
              fill
              className="rounded-full"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold md:text-2xl">{vendor.name}</h1>
            <p className="text-sm text-gray-500 md:text-base">{vendor.bio}</p>
          </div>
        </div>
        <h2 className="text-lg font-semibold mb-4 md:text-xl">Products</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {vendorProducts.map((product) => (
            <div
              key={product.id}
              className="border rounded-md bg-white overflow-hidden"
            >
              <Link href={`/product/${product.id}`}>
                <div className="relative w-full h-32">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>
              <div className="p-2">
                <h2 className="text-sm font-semibold truncate">
                  {product.name}
                </h2>
                <p className="text-xs text-gray-600">
                  NPR {product.base_price}
                </p>
                <div className="flex gap-1 mt-2">
                  <Link href={`/product/${product.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      View
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="text-xs"
                    onClick={() =>
                      useCartStore.getState().addItem({
                        productId: product.id,
                        quantity: 1,
                        price: product.base_price,
                        name: product.name,
                        image_url: product.image_url,
                      })
                    }
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
