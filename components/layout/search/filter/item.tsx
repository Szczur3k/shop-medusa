'use client';

import { createUrl } from 'lib/utils';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { ListItem } from '.';

export function FilterItem({ item }: { item: ListItem }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = pathname === ('path' in item ? item.path : createUrl(pathname, searchParams));
  const newParams = new URLSearchParams(searchParams.toString());

  if ('path' in item) {
    return (
      <li className="mt-2 flex text-black dark:text-white">
        <Link
          href={item.path}
          className={`w-full px-4 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
            active ? 'bg-gray-100 font-semibold dark:bg-gray-800' : ''
          }`}
        >
          {item.title}
        </Link>
      </li>
    );
  }

  if ('slug' in item) {
    newParams.set('sort', item.slug);
  }

  return (
    <li className="mt-2 flex text-black dark:text-white">
      <Link
        href={createUrl(pathname, newParams)}
        className={`w-full px-4 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
          active ? 'bg-gray-100 font-semibold dark:bg-gray-800' : ''
        }`}
      >
        {item.title}
      </Link>
    </li>
  );
}
