// src/app/search/page.tsx
// NO 'use client' directive here! This is a Server Component.

import { Suspense } from 'react';
import SearchResults from '@/components/search-results'; // This component still has 'use client'

export default function SearchPage() {
  return (
    <main className="container mx-auto p-4">
      <Suspense fallback={<div className="text-center py-10 text-gray-600">Loading search results...</div>}>
        <SearchResults />
      </Suspense>
    </main>
  );
}