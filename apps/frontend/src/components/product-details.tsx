'use client';

import Image from 'next/image';
import { useCartStore } from '@/lib/store';
import { useState } from 'react';

interface Variant {
  id: string;
  variant_name: string;
  variant_value: string;
  price_adjustment: number;
  stock: number;
  variant_img: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  stock: number;
  product_img?: string;
  vendor: { name: string; shop_name: string };
  category: { cat_name: string };
  variants: Variant[];
}

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants.length > 0 ? product.variants[0] : null
  );
  const { addToCart } = useCartStore();

  const handleAddToCart = async () => {
    await addToCart(product.id, selectedVariant?.id, 1);
    alert('Product added to cart!'); // Replace with a toast notification in production
  };

  const finalPrice = selectedVariant
    ? product.base_price + selectedVariant.price_adjustment
    : product.base_price;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="relative w-full h-64 md:h-96 md:w-1/2">
          {selectedVariant?.variant_img || product.product_img ? (
            <Image
              src={selectedVariant?.variant_img || product.product_img || ''}
              alt={product.name}
              fill
              className="object-cover rounded"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              No Image
            </div>
          )}
        </div>
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-gray-600 mt-2">NPR {finalPrice.toFixed(2)}</p>
          <p className="text-gray-500 mt-1">By {product.vendor?.shop_name || "Amigo Mall"}</p>
          <p className="text-gray-500">Category: {product.category.cat_name}</p>
          {product.description && (
            <p className="mt-4">{product.description}</p>
          )}
          {product.variants.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Variants</h3>
              <select
                className="border p-2 mt-2 w-full"
                value={selectedVariant?.id || ''}
                onChange={(e) =>
                  setSelectedVariant(
                    product.variants.find((v) => v.id === e.target.value) || null
                  )
                }
              >
                {product.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.variant_name}: {variant.variant_value} (+NPR {variant.price_adjustment.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          )}
          <p className="mt-2">Stock: {selectedVariant?.stock || product.stock}</p>
          <button
            onClick={handleAddToCart}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded"
            disabled={(selectedVariant?.stock || product.stock) === 0}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}