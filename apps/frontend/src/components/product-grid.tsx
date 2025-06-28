'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import { Suspense } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  stock: number;
  category_id: string;
  vendor_id: string;
  product_img: string | null;
  created_at: string;
  updated_at?: string;
  // Joined fields (optional)
  category?: {
    id: string;
    name: string;
  };
  vendor?: {
    id: string;
    name: string;
    shop_name: string;
  };
  // Computed fields
  rating?: number;
  discount_price?: number | null;
}

interface ProductGridProps {
  products: Product[];
  title?: string;
  className?: string;
  showVendor?: boolean;
  showCategory?: boolean;
  showStock?: boolean;
}

export default function ProductGrid({
  products,
  title = 'Products',
  className = '',
  showVendor = true,
  showCategory = true,
  showStock = false,
}: ProductGridProps) {
  return (
    <div className={`container mx-auto p-4 ${className}`}>
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="group relative border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
          >
            {/* Product Image */}
            <Link href={`/product/${product.id}`} className="block">
              <div className="relative w-full aspect-square bg-gray-100">
                {product.product_img ? (
                  <Image
                    src={product.product_img}
                    alt={product.name}
                    fill
                    className="object-cover transition-opacity group-hover:opacity-90"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    priority={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3 space-y-1">
                <h3 className="text-sm font-medium line-clamp-2 h-10">
                  {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    NPR {product.base_price.toFixed(2)}
                  </span>
                  {product.discount_price && (
                    <span className="text-xs text-gray-500 line-through">
                      NPR {product.discount_price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Rating */}
                {product.rating !== undefined && (
                  <div className="flex items-center text-xs text-yellow-500">
                    <FaStar className="mr-0.5" />
                    <span>{product.rating.toFixed(1)}</span>
                  </div>
                )}

                {/* Stock */}
                {showStock && (
                  <p className="text-xs text-gray-500">
                    {product.stock > 0 
                      ? `${product.stock} in stock` 
                      : 'Out of stock'}
                  </p>
                )}

                {/* Vendor */}
                {showVendor && product.vendor && (
                  <p className="text-xs text-gray-500 truncate">
                    {product.vendor.shop_name || product.vendor.name}
                  </p>
                )}

                {/* Category */}
                {showCategory && product.category && (
                  <p className="text-xs text-gray-500 truncate">
                    {product.category.name}
                  </p>
                )}
              </div>
            </Link>

            {/* Quick Actions (using Suspense for client-side interactivity) */}
            <Suspense fallback={null}>
              {/* <ProductQuickActions 
                productId={product.id} 
                stock={product.stock}
                className="absolute bottom-16 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              /> */}
            </Suspense>
          </div>
        ))}
      </div>
    </div>
  );
}