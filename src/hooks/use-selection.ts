import { useState, useCallback, useMemo } from 'react';

export interface UseSelectionReturn<T> {
  selectedIds: Set<string>;
  selectedItems: T[];
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  select: (id: string) => void;
  deselect: (id: string) => void;
  toggle: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleAll: () => void;
  selectMultiple: (ids: string[]) => void;
  selectedCount: number;
}

export function useSelection<T extends { id: string }>(
  items: T[]
): UseSelectionReturn<T> {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allIds = useMemo(() => items.map((item) => item.id), [items]);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const isAllSelected = useMemo(
    () => items.length > 0 && allIds.every((id) => selectedIds.has(id)),
    [allIds, selectedIds, items.length]
  );

  const isPartiallySelected = useMemo(
    () => selectedIds.size > 0 && !isAllSelected,
    [selectedIds.size, isAllSelected]
  );

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.has(item.id)),
    [items, selectedIds]
  );

  const select = useCallback((id: string) => {
    setSelectedIds((prev) => new Set(prev).add(id));
  }, []);

  const deselect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(allIds));
  }, [allIds]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [isAllSelected, selectAll, deselectAll]);

  const selectMultiple = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  return {
    selectedIds,
    selectedItems,
    isSelected,
    isAllSelected,
    isPartiallySelected,
    select,
    deselect,
    toggle,
    selectAll,
    deselectAll,
    toggleAll,
    selectMultiple,
    selectedCount: selectedIds.size,
  };
}
