'use client';

import { useEffect, useState } from 'react';

export function useStoreCurrency() {
  const [defaultCurrency, setDefaultCurrency] = useState('PLN');

  useEffect(() => {
    async function fetchStoreCurrency() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API}/store/store`, {
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || ''
          } 
        });
        const data = await response.json();
        const defaultCurrency = data.store.default_currency_code?.toUpperCase() || 'PLN';
        setDefaultCurrency(defaultCurrency);
      } catch (error) {
        console.error('Error fetching store currency:', error);
      }
    }

    fetchStoreCurrency();
  }, []);

  return defaultCurrency;
} 