import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SmartPaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSize?: boolean;
  showInfo?: boolean;
  className?: string;
}

export function SmartPagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50, 100],
  showPageSize = true,
  showInfo = true,
  className,
}: SmartPaginationProps) {
  const canPrevPage = page > 1;
  const canNextPage = page < totalPages;

  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (page > 3) {
        pages.push('ellipsis');
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push('ellipsis');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4',
        className
      )}
    >
      {showInfo && (
        <div className="text-sm text-muted-foreground">
          បង្ហាញ {startItem} - {endItem} នៃ {totalItems} ធាតុ
        </div>
      )}

      <div className="flex items-center gap-4">
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">ជួរដេក:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(1)}
            disabled={!canPrevPage}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(page - 1)}
            disabled={!canPrevPage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="hidden sm:flex items-center gap-1">
            {getPageNumbers().map((pageNum, index) =>
              pageNum === 'ellipsis' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-8 w-8 items-center justify-center"
                >
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </span>
              ) : (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            )}
          </div>

          <span className="sm:hidden text-sm text-muted-foreground px-2">
            {page} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(page + 1)}
            disabled={!canNextPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(totalPages)}
            disabled={!canNextPage}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
