'use client';

import clsx from 'clsx';
import LoadingDots from 'components/loading-dots';
import { addToCart, createCart } from 'lib/medusa/client';
import { ProductVariant } from 'lib/medusa/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

function setCookie(name: string, value: string, days: number = 90) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

export function AddToCart({
  variants,
  availableForSale
}: {
  variants: ProductVariant[];
  availableForSale: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const variant = variants.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) => option.value === searchParams.get(option.name.toLowerCase())
    )
  );
  const selectedVariantId = variant?.id || defaultVariantId;
  const title = !availableForSale
    ? 'Out of stock'
    : !selectedVariantId
    ? 'Please select options'
    : isPending
    ? 'Adding...'
    : 'Add to cart';

  const handleAddToCart = useCallback(async () => {
    if (!selectedVariantId) return;
    
    try {
      let cartId = getCookie('cartId');
      
      if (!cartId) {
        const cart = await createCart();
        if (!cart?.id) {
          throw new Error('Failed to create cart');
        }
        cartId = cart.id;
        setCookie('cartId', cartId);
      }

      await addToCart(cartId, {
        variantId: selectedVariantId,
        quantity: 1
      });
      
      router.refresh();
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  }, [selectedVariantId, router]);

  return (
    <button
      aria-label="Add to cart"
      disabled={isPending || !availableForSale || !selectedVariantId}
      onClick={() => {
        if (!availableForSale || !selectedVariantId) return;
        startTransition(handleAddToCart);
      }}
      className={clsx(
        'flex w-full items-center justify-center bg-black p-4 text-sm uppercase tracking-wide text-white opacity-90 hover:opacity-100 dark:bg-white dark:text-black',
        {
          'cursor-not-allowed opacity-60': !availableForSale || !selectedVariantId,
          'cursor-not-allowed': isPending
        }
      )}
    >
      <span>{title}</span>
      {isPending ? <LoadingDots className="bg-white dark:bg-black" /> : null}
    </button>
  );
}
