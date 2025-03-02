'use client';

import { useStoreCurrency } from 'lib/hooks/use-store-currency';

const Price = ({
  amount,
  className,
  currencyCode,
  currencyCodeClassName
}: {
  amount: string;
  className?: string;
  currencyCode?: string;
  currencyCodeClassName?: string;
} & React.ComponentProps<'p'>) => {
  const defaultCurrency = useStoreCurrency();
  const formattedCurrencyCode = (currencyCode || defaultCurrency).toUpperCase();
  
  return (
    <p suppressHydrationWarning={true} className={className}>
      {`${formattedCurrencyCode === 'PLN' ? '' : '$'}${parseFloat(amount).toFixed(2)}${formattedCurrencyCode}`}
    </p>
  );
};

export default Price;
