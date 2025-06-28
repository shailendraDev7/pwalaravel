// src/components/home-hero-swiper.tsx
'use client'; // This directive is CRUCIAL to make this a Client Component

import Image from 'next/image';
import Link from 'next/link';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper modules
import { Autoplay, Pagination } from 'swiper/modules';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

// Import your banners data. For static data, importing directly is fine.
// If this data were dynamic (e.g., from an API), you'd pass it as props
// from the Server Component `page.tsx` after fetching.
import { banners } from '@/lib/mock-data'; // Assuming this data is pre-fetched/static

export default function SwiperSlider() {
  // Filter banners or use specific ones for the hero section
  const heroBanners = banners.slice(0, 3); // Example: show first 3 banners

  return (
    <section className="mb-6">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={10}
        slidesPerView={1}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false, // Keep autoplay even if user interacts
        }}
        pagination={{ clickable: true }}
        className="rounded-lg"
      >
        {heroBanners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <Link href={`/banner/${banner.id}`}>
              <div className="relative w-full h-48 md:h-64">
                <Image
                  src={banner.image_url}
                  alt={banner.name}
                  fill
                  className="object-cover rounded-lg"
                  priority // Good for images above the fold
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                  <h3 className="text-lg font-semibold">{banner.name}</h3>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}