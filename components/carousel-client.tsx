'use client';

import type { Product } from 'lib/medusa/types';
import Link from 'next/link';
import { GridTileImage } from './grid/tile';

export default function CarouselClient({ products }: { products: Product[] }) {
  return (
    <div className="w-full overflow-x-auto pb-6 pt-1">
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((product, i) => (
          <li
            key={`${product.handle}${i}`}
            className="relative h-[200px] w-full overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <Link href={`/product/${product.handle}`} className="relative h-full w-full">
              <GridTileImage
                alt={product.featuredImage?.altText}
                label={{
                  title: product.title,
                  amount: product.priceRange.maxVariantPrice.amount,
                  currencyCode: product.priceRange.maxVariantPrice.currencyCode,
                  position: 'bottom'
                }}
                src={product.featuredImage?.url}
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
} 