export const SORT_VALUES = ['newest', 'version-desc', 'version-asc'] as const;
export type SortValue = (typeof SORT_VALUES)[number];

export function isSortValue(value: string | null): value is SortValue {
  return SORT_VALUES.includes(value as SortValue);
}
