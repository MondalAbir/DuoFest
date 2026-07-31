import type { ReactNode } from "react";
import { SearchInput } from "@/components/common/SearchInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterOption {
  value: string;
  label: string;
}

interface TableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterLabel?: string;
  total?: number;
  actions?: ReactNode;
}

export function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search records…",
  filterValue,
  onFilterChange,
  filterOptions,
  filterLabel = "Filter by status",
  total,
  actions,
}: TableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="w-full sm:max-w-xs"
        />
        {filterOptions && onFilterChange && (
          <Select value={filterValue} onValueChange={onFilterChange}>
            <SelectTrigger className="w-full sm:w-44" aria-label={filterLabel}>
              <SelectValue placeholder={filterLabel} />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {total !== undefined && (
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{total}</span>{" "}
            record{total === 1 ? "" : "s"}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
