'use server';

import { TAGS } from 'lib/constants';
import { revalidateTag } from 'next/cache';
import { headers } from 'next/headers';

const ENDPOINT = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API ?? 'http://localhost:9000';
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY ?? '';

async function medusaServerRequest({
  method,
  path,
  tags
}: {
  method: string;
  path: string;
  tags?: string[];
}) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY
    },
    ...(tags && { next: { tags } })
  };

  try {
    const result = await fetch(`${ENDPOINT}/store${path}`, options);
    const body = await result.json();

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body
    };
  } catch (error) {
    console.error('Error in medusaServerRequest:', error);
    throw error;
  }
}

export async function getCategoryProducts(handle: string) {
  const res = await medusaServerRequest({
    method: 'GET',
    path: `/products?category_id[]=${handle}`,
    tags: [TAGS.products]
  });

  return res.body.products;
}

export async function revalidate(path: string) {
  const headersList = headers();
  const key = headersList.get('authorization');

  if (key !== process.env.MEDUSA_REVALIDATION_SECRET) {
    return new Response('Invalid key', { status: 403 });
  }

  revalidateTag(TAGS.products);

  return new Response('Success!', { status: 200 });
} 