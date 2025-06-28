import { categories } from "@/lib/mock-data";
import Link from "next/link";

export default function AppFooter() {
  return (
    <footer className="hidden md:block bg-gray-800 text-white py-8 mt-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Amigo eStore</h3>
          <p className="text-sm">
            Your trusted E-Commerce Shoes platform in Nepal.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4">Shop</h3>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="text-sm hover:underline"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4">Support</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/contact" className="text-sm hover:underline">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-sm hover:underline">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/returns" className="text-sm hover:underline">
                Returns
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4">Legal</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/terms" className="text-sm hover:underline">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-sm hover:underline">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-8 text-center text-sm">
        <p>&copy; 2025 Amigo eStore. All rights reserved.</p>
      </div>
    </footer>
  );
}
