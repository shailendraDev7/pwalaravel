// src/app/categories/[categoryId]/page.tsx (Server Component)

import { supabase } from "@/lib/supabase"; // Used for data fetching
import ProductGrid from "@/components/product-grid"; // Assuming this is a Client Component
import { Suspense } from "react";
import Link from "next/link";

interface SpecificCategoryPageProps {
  params: {
    categoryId: string;
  };
}

export default async function SpecificCategoryPage({
  params,
}: SpecificCategoryPageProps): Promise<React.ReactNode> {
  const { categoryId } = params; // Used to fetch data

  // 1. Fetch the specific category details to get its name
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("cat_name")
    .eq("id", categoryId) // Uses categoryId
    .single();

  if (categoryError) {
    console.error(`Error fetching category with ID ${categoryId}:`, categoryError);
    return (
      <div className="container mx-auto p-4 text-red-500">
        Category not found or an error occurred.
        <div className="mt-4">
          <Link href="/categories" className="text-blue-600 hover:underline dark:text-blue-400">
            ← Back to All Categories
          </Link>
        </div>
      </div>
    );
  }

  // 2. Fetch products belonging to this category
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, description, price, image_url, category_id, categories(cat_name)")
    .eq("category_id", categoryId) // Uses categoryId
    .order("created_at", { ascending: false });

  if (productsError) {
    console.error(`Error fetching products for category ${categoryId}:`, productsError);
    return (
      <div className="container mx-auto p-4 text-red-500">
        Failed to load products for this category.
      </div>
    );
  }

  const categoryName = category?.cat_name || "Category";

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Products in {categoryName}
      </h1>

      <div className="mb-6">
        <Link href="/categories" className="text-blue-600 hover:underline dark:text-blue-400">
          ← Back to All Categories
        </Link>
      </div>

      <Suspense fallback={<div className="text-center p-4">Loading products...</div>}>
        <ProductGrid products={products || []} title={`All ${categoryName} Products`} />
      </Suspense>
    </main>
  );
}