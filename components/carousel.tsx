'use server';

import { getCategoryProducts } from 'lib/medusa/actions';
import { Suspense } from 'react';
import CarouselClient from './carousel-client';

export async function Carousel() {
  // Collections that start with `hidden-*` are hidden from the search page.
  const products = await getCategoryProducts('hidden-homepage-carousel');

  if (!products?.length) return null;

  // Purposefully duplicating products to make the carousel loop and not run out of products on wide screens.
  const carouselProducts = [...products, ...products, ...products];

  return (
    <Suspense>
      <CarouselClient products={carouselProducts} />
    </Suspense>
  );
}
