import { computeAmount, convertToDecimal } from './helpers';
import { Cart, MedusaProduct, Product } from './types';

const ENDPOINT = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API ?? 'http://localhost:9000';
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY ?? '';

const reshapeProduct = (product: MedusaProduct): Product => {
  const variant = product.variants?.[0];

  let amount = '0';
  let currencyCode = 'USD';
  if (variant && variant.prices?.[0]?.amount) {
    currencyCode = variant.prices[0].currency_code.toUpperCase() ?? 'USD';
    amount = convertToDecimal(variant.prices[0].amount, currencyCode).toString();
  }

  const priceRange = {
    maxVariantPrice: {
      amount,
      currencyCode: product.variants?.[0]?.prices?.[0]?.currency_code.toUpperCase() ?? ''
    }
  };

  const thumbnailFilename = product.thumbnail?.split('/').pop()?.split('.')[0] || '';

  return {
    title: product.title,
    priceRange,
    updatedAt: product.updated_at,
    createdAt: product.created_at,
    options: product.options?.map(option => ({
      id: option.id,
      title: option.title,
      created_at: option.created_at,
      updated_at: option.updated_at,
      product_id: option.product_id,
      availableForSale: true,
      name: option.title,
      values: option.values?.map(value => value.value) || []
    })) || [],
    tags: product.tags?.map((tag) => tag.value) || [],
    descriptionHtml: product.description ?? '',
    availableForSale: product.variants?.[0]?.purchasable || true,
    featuredImage: {
      url: product.thumbnail ?? '',
      altText: `${product.title} - ${thumbnailFilename}`
    },
    images: product.images?.map(image => ({
      id: image.id,
      url: image.url,
      altText: `${product.title} - ${image.url.split('/').pop()?.split('.')[0] || ''}`,
      created_at: image.created_at,
      updated_at: image.updated_at
    })) || [],
    seo: {
      title: product.title,
      description: product.description || ''
    },
    variants: product.variants?.map(variant => ({
      id: variant.id,
      title: variant.title,
      availableForSale: variant.purchasable ?? true,
      product_id: variant.product_id,
      created_at: variant.created_at,
      updated_at: variant.updated_at,
      deleted_at: variant.deleted_at,
      inventory_quantity: variant.inventory_quantity,
      allow_backorder: variant.allow_backorder,
      manage_inventory: variant.manage_inventory,
      selectedOptions: variant.options?.map(option => ({
        name: option.option?.title || '',
        value: option.value
      })) || [],
      price: {
        amount: variant.prices?.[0] ? convertToDecimal(variant.prices[0].amount, variant.prices[0].currency_code).toString() : '0',
        currencyCode: variant.prices?.[0]?.currency_code.toUpperCase() ?? 'USD'
      }
    })) || []
  };
};

const reshapeCart = (cart: any): Cart => {
  if (!cart) return {} as Cart;

  const currencyCode = cart.region?.currency_code?.toUpperCase() || 'USD';
  let subtotalAmount = '0';
  let totalAmount = '0';
  let totalTaxAmount = '0';

  if (cart.subtotal && cart.region) {
    subtotalAmount = computeAmount({ amount: cart.subtotal, region: cart.region }).toString();
  }

  if (cart.total && cart.region) {
    totalAmount = computeAmount({ amount: cart.total, region: cart.region }).toString();
  }

  if (cart.tax_total && cart.region) {
    totalTaxAmount = computeAmount({ amount: cart.tax_total, region: cart.region }).toString();
  }

  return {
    ...cart,
    totalQuantity: cart.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0,
    cost: {
      subtotalAmount: {
        amount: subtotalAmount,
        currencyCode
      },
      totalAmount: {
        amount: totalAmount,
        currencyCode
      },
      totalTaxAmount: {
        amount: totalTaxAmount,
        currencyCode
      }
    }
  };
};

async function medusaClientRequest({
  method,
  path,
  payload
}: {
  method: string;
  path: string;
  payload?: Record<string, unknown>;
}) {
  console.log('Making request to:', `${ENDPOINT}/store${path}`);
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY
    },
    credentials: 'include'
  };

  if (payload) {
    options.body = JSON.stringify(payload);
  }

  try {
    console.log('Request options:', options);
    const result = await fetch(`${ENDPOINT}/store${path}`, options);
    
    if (!result.ok) {
      console.error('Medusa request failed:', {
        status: result.status,
        statusText: result.statusText,
        url: result.url
      });
      throw new Error(`Request failed with status ${result.status}`);
    }

    const body = await result.json();
    console.log('Response body:', body);

    if (body.errors) {
      console.error('Medusa response errors:', body.errors);
      throw body.errors[0];
    }

    return {
      status: result.status,
      body
    };
  } catch (e) {
    console.error('Medusa request error:', e);
    throw e;
  }
}

export async function createCart(): Promise<Cart> {
  const res = await medusaClientRequest({ method: 'POST', path: '/carts' });
  return reshapeCart(res.body.cart);
}

export async function getCart(cartId: string): Promise<Cart | null> {
  try {
    const res = await medusaClientRequest({ method: 'GET', path: `/carts/${cartId}` });
    return reshapeCart(res.body.cart);
  } catch (error) {
    console.error('Error getting cart:', error);
    return null;
  }
}

export async function addToCart(
  cartId: string,
  lineItem: { variantId: string; quantity: number }
): Promise<Cart> {
  const res = await medusaClientRequest({
    method: 'POST',
    path: `/carts/${cartId}/line-items`,
    payload: {
      variant_id: lineItem?.variantId,
      quantity: lineItem?.quantity
    }
  });
  return reshapeCart(res.body.cart);
}

export async function removeFromCart(cartId: string, lineItemId: string): Promise<Cart> {
  const res = await medusaClientRequest({
    method: 'DELETE',
    path: `/carts/${cartId}/line-items/${lineItemId}`
  });
  return reshapeCart(res.body.cart);
}

export async function updateCart(
  cartId: string,
  { lineItemId, quantity }: { lineItemId: string; quantity: number }
): Promise<Cart> {
  const res = await medusaClientRequest({
    method: 'POST',
    path: `/carts/${cartId}/line-items/${lineItemId}`,
    payload: {
      quantity
    }
  });
  return reshapeCart(res.body.cart);
}

export async function getProducts({
  query,
  reverse,
  sortKey
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
} = {}): Promise<Product[]> {
  try {
    const path = query 
      ? `/products?q=${query}&limit=100`
      : '/products?limit=100';
      
    const res = await medusaClientRequest({ method: 'GET', path });
    
    if (!res?.body?.products) {
      return [];
    }

    let products = res.body.products.map((product: MedusaProduct) => reshapeProduct(product));

    if (sortKey === 'PRICE') {
      products.sort((a: Product, b: Product) =>
        parseFloat(a.priceRange.maxVariantPrice.amount) -
        parseFloat(b.priceRange.maxVariantPrice.amount)
      );
    }

    if (sortKey === 'CREATED_AT') {
      products.sort((a: Product, b: Product) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    if (reverse) {
      products.reverse();
    }

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}