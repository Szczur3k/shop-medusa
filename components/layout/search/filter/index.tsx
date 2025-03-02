import { SortFilterItem } from 'lib/constants';
import FilterItemDropdown from './dropdown';
import { FilterItem } from './item';

export type ListItem = SortFilterItem | PathFilterItem;
export type PathFilterItem = { title: string; path: string };

function FilterItemList({ list }: { list: ListItem[] }) {
  return (
    <>
      {list.map((item: ListItem, i) => (
        <FilterItem key={i} item={item} />
      ))}
    </>
  );
}

export default function FilterList({ list, title }: { list: ListItem[]; title?: string }) {
  return (
    <nav className="sticky top-20">
      {title ? (
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      ) : null}
      <ul className="hidden space-y-3 md:block">
        <FilterItemList list={list} />
      </ul>
      <ul className="md:hidden">
        <FilterItemDropdown list={list} />
      </ul>
    </nav>
  );
}
