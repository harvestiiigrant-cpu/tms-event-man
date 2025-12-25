import { useState, useMemo, useCallback } from 'react';

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationActions {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
}

export interface UsePaginationReturn extends PaginationState, PaginationActions {
  canNextPage: boolean;
  canPrevPage: boolean;
  pageRange: number[];
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
  totalItems = 0,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [total, setTotal] = useState(totalItems);

  const totalPages = useMemo(() => Math.ceil(total / pageSize) || 1, [total, pageSize]);

  const canNextPage = page < totalPages;
  const canPrevPage = page > 1;

  const setPage = useCallback(
    (newPage: number) => {
      const validPage = Math.max(1, Math.min(newPage, totalPages));
      setPageState(validPage);
    },
    [totalPages]
  );

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPageState(1); // Reset to first page when changing size
  }, []);

  const nextPage = useCallback(() => {
    if (canNextPage) setPage(page + 1);
  }, [canNextPage, page, setPage]);

  const prevPage = useCallback(() => {
    if (canPrevPage) setPage(page - 1);
  }, [canPrevPage, page, setPage]);

  const firstPage = useCallback(() => setPage(1), [setPage]);
  const lastPage = useCallback(() => setPage(totalPages), [setPage, totalPages]);

  // Generate page range for pagination UI
  const pageRange = useMemo(() => {
    const range: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }, [page, totalPages]);

  return {
    page,
    pageSize,
    totalItems: total,
    totalPages,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    canNextPage,
    canPrevPage,
    pageRange,
  };
}

// Hook for client-side pagination of data
export function useClientPagination<T>(data: T[], pageSize: number = 10) {
  const [page, setPage] = useState(1);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  const canNextPage = page < totalPages;
  const canPrevPage = page > 1;

  return {
    data: paginatedData,
    page,
    pageSize,
    totalItems,
    totalPages,
    setPage,
    canNextPage,
    canPrevPage,
    nextPage: () => canNextPage && setPage(page + 1),
    prevPage: () => canPrevPage && setPage(page - 1),
  };
}
