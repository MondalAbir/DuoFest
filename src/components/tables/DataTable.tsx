import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Inbox,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export type ColumnAlign = "left" | "center" | "right";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (item: T) => ReactNode;
  className?: string;
  align?: ColumnAlign;
  sortable?: boolean;
  sortValue?: (item: T) => string | number;
  hideBelow?: "sm" | "md" | "lg";
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (item: T) => string;
  pageSize?: number;
  compact?: boolean;
  emptyMessage?: string;
  loading?: boolean;
  loadingRows?: number;
  selection?: {
    selectedKeys: Set<string>;
    onSelectionChange: (key: string) => void;
    onSelectAll: () => void;
  };
}

const HIDDEN_CLASS: Record<string, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

const ALIGN_CLASS: Record<ColumnAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function Pagination({
  page,
  totalPages,
  onPageChange,
  showingStart,
  showingEnd,
  total,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showingStart: number;
  showingEnd: number;
  total: number;
}) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-5 py-3.5 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">{showingStart}</span>–
        <span className="font-medium text-foreground">{showingEnd}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft />
        </Button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === page ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => onPageChange(pageNumber)}
              aria-label={`Page ${pageNumber}`}
              aria-current={pageNumber === page ? "page" : undefined}
              className={pageNumber === page ? "pointer-events-none" : undefined}
            >
              {pageNumber}
            </Button>
          ),
        )}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  pageSize = 8,
  compact = false,
  emptyMessage = "No records found",
  loading = false,
  loadingRows = 6,
  selection,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const sorted = useMemo(() => {
    if (!sort) return data;
    const column = columns.find((col) => col.key === sort.key);
    if (!column?.sortValue) return data;
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...data].sort((a, b) => {
      const aValue = column.sortValue!(a);
      const bValue = column.sortValue!(b);
      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * factor;
      }
      return String(aValue).localeCompare(String(bValue)) * factor;
    });
  }, [data, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageItems = sorted.slice(startIndex, startIndex + pageSize);

  const toggleSort = (column: DataTableColumn<T>) => {
    setSort((current) => {
      if (!current || current.key !== column.key) {
        return { key: column.key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key: column.key, direction: "desc" };
      }
      return null;
    });
  };

  const sortIcon = (column: DataTableColumn<T>) => {
    if (sort?.key !== column.key) return <ChevronsUpDown className="h-3.5 w-3.5" />;
    return sort.direction === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    );
  };

  const allPageSelected =
    selection && pageItems.length > 0 &&
    pageItems.every((item) => selection.selectedKeys.has(rowKey(item)));
  const somePageSelected =
    selection && pageItems.some((item) => selection.selectedKeys.has(rowKey(item)));

  const renderHeaderCheckbox = () => {
    if (!selection) return null;
    return (
      <th key="__select-all" scope="col" className="w-12 px-5 py-3.5">
        <input
          ref={(node) => {
            if (node) node.indeterminate = Boolean(somePageSelected && !allPageSelected);
          }}
          type="checkbox"
          checked={Boolean(allPageSelected)}
          onChange={selection.onSelectAll}
          onClick={(event) => event.stopPropagation()}
          className="h-4 w-4 shrink-0 rounded border-border accent-primary"
          aria-label="Select all rows"
        />
      </th>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {renderHeaderCheckbox()}
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                    ALIGN_CLASS[column.align ?? "left"],
                    compact && "px-4 py-3",
                    column.hideBelow && HIDDEN_CLASS[column.hideBelow],
                    column.className,
                  )}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column)}
                      className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                      aria-label={`Sort by ${String(column.header).toLowerCase()}`}
                    >
                      {column.header}
                      <span className={sort?.key === column.key ? "text-primary" : ""}>
                        {sortIcon(column)}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: loadingRows }).map((_, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-border last:border-0"
                  >
                    {selection && (
                      <td className="px-5 py-3">
                        <Skeleton className="h-4 w-4 rounded" />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-5 py-3",
                          compact && "px-4 py-2.5",
                          column.hideBelow && HIDDEN_CLASS[column.hideBelow],
                        )}
                      >
                        <Skeleton className="h-4 w-full max-w-28" />
                      </td>
                    ))}
                  </tr>
                ))
              : pageItems.length === 0
                ? (
                  <tr>
                    <td colSpan={columns.length}>
                      <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                          <Inbox className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {emptyMessage}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search or filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                )
                : pageItems.map((item, rowIndex) => (
                    <motion.tr
                      key={rowKey(item)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: Math.min(rowIndex, 5) * 0.04 }}
                      className={cn(
                        "border-b border-border transition-colors last:border-0 hover:bg-muted/50",
                      )}
                    >
                      {selection && (
                        <td className="px-5 py-3.5 align-middle">
                          <input
                            type="checkbox"
                            checked={selection.selectedKeys.has(rowKey(item))}
                            onChange={() => selection.onSelectionChange(rowKey(item))}
                            onClick={(event) => event.stopPropagation()}
                            className="h-4 w-4 shrink-0 rounded border-border accent-primary"
                            aria-label={`Select ${rowKey(item)}`}
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cn(
                            "px-5 py-3.5 align-middle",
                            compact && "px-4 py-3",
                            ALIGN_CLASS[column.align ?? "left"],
                            column.hideBelow && HIDDEN_CLASS[column.hideBelow],
                            column.className,
                          )}
                        >
                          {column.cell(item)}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
          </tbody>
        </table>
      </div>
      {!loading && pageItems.length > 0 && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          showingStart={startIndex + 1}
          showingEnd={Math.min(startIndex + pageSize, sorted.length)}
          total={sorted.length}
        />
      )}
    </div>
  );
}
