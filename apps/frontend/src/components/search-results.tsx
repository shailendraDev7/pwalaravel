'use client';

import { useSearchParams } from 'next/navigation';
import { getProducts as products } from "@/lib/products";
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import translations from '@/lib/locales/ne.json';
import { useCartStore } from '@/lib/store';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center md:text-3xl">
        Search Results for &quot;{searchQuery}&quot;
      </h1>
      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500">{translations.search_no_results}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden transform transition-transform hover:scale-105 shadow-lg">
              <CardHeader className="p-0">
                <Link href={`/product/${product.id}`}>
                  <div className="relative w-full h-40 md:h-48">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                      className="object-cover rounded-t-md"
                    />
                  </div>
                </Link>
              </CardHeader>
              <CardContent className="p-3">
                <CardTitle className="text-base font-semibold truncate mb-1">{product.name}</CardTitle>
                <p className="text-lg font-bold text-blue-700">NPR {product.base_price}</p>
                <div className="flex gap-2 mt-3">
                  <Link href={`/product/${product.id}`} className="flex-1">
                    <Button variant="outline" className="w-full text-sm">
                      View
                    </Button>
                  </Link>
                  <Button
                    className="flex-1 text-sm"
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}