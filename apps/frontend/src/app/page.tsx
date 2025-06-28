import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import { categories } from "@/lib/mock-data";
import SwiperSlider from "@/components/swiper-slider";
import ProductGrid from "@/components/product-grid";

export default async function Home() {
  const products = await getProducts();
  return (
    <main className="container mx-auto p-4">
      <Suspense fallback={<div>Loading banners...</div>}>
        <SwiperSlider />
      </Suspense>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 md:text-2xl">Categories</h2>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant="secondary"
              className="px-3 py-1 text-md"
            >
              {category.name}
            </Badge>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2 md:text-2xl">
          Featured Products
        </h2>
        <Suspense fallback={<div>Loading products...</div>}>
          <ProductGrid products={products} title="Men" />
        </Suspense>
      </section>
    </main>
  );
}
