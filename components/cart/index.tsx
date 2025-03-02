'use client';

import { createCart, getCart } from 'lib/medusa/client';
import { Cart as CartType } from 'lib/medusa/types';
import { useEffect, useState } from 'react';
import CartModal from './modal';

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

export default function Cart() {
  const [cart, setCart] = useState<CartType | undefined>(undefined);

  useEffect(() => {
    async function initCart() {
      try {
        let cartId = getCookie('cartId');
        let cartData: CartType | undefined = undefined;

        if (cartId) {
          cartData = await getCart(cartId) || undefined;
        }

        if (!cartId || !cartData) {
          cartData = await createCart();
          if (cartData?.id) {
            setCookie('cartId', cartData.id);
          }
        }

        setCart(cartData);
      } catch (error) {
        console.error('Error initializing cart:', error);
      }
    }

    initCart();
  }, []);

  return <CartModal cart={cart} />;
}
