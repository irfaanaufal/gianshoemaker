import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMediaQuery } from "@/lib/use-media-query";
import { ChevronDown } from "lucide-react";

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  visible?: boolean;
  render?: (value: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowIdKey?: keyof T;
  actions?: (row: T) => React.ReactNode;
}

export function DataTable<T extends { [key: string]: any }>({
  data,
  columns,
  rowIdKey = "id",
  actions,
}: DataTableProps<T>) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [searchKey, setSearchKey] = useState<keyof T>(columns[0].key);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [columnsVisible, setColumnsVisible] = useState<Set<keyof T>>(new Set(columns.map(col => col.key)));
  const [perPage, setPerPage] = useState(5);

  const toggleColumn = (key: keyof T) => {
    setColumnsVisible(prev => {
      const copy = new Set(prev);
      copy.has(key) ? copy.delete(key) : copy.add(key);
      return copy;
    });
  };

  const filtered = useMemo(() => {
    return data.filter(row => {
      const value = row[searchKey];
      return String(value).toLowerCase().includes(searchValue.toLowerCase());
    });
  }, [data, searchKey, searchValue]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortAsc]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, currentPage, perPage]);

  const maxPage = Math.ceil(sorted.length / perPage);

  const visibleColumns = columns.filter(col => columnsVisible.has(col.key));

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <Input
          placeholder="Search..."
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Search by: {String(searchKey)} <ChevronDown className="ml-2 w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {columns.map(col => (
              <DropdownMenuItem key={String(col.key)} onSelect={() => setSearchKey(col.key)}>
                {col.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Toggle Columns <ChevronDown className="ml-2 w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {columns.map(col => (
              <DropdownMenuItem key={String(col.key)} onSelect={() => toggleColumn(col.key)}>
                <input type="checkbox" checked={columnsVisible.has(col.key)} readOnly className="mr-2" /> {col.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Show: {perPage} <ChevronDown className="ml-2 w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[5, 10, 20, 30, 50].map(size => (
              <DropdownMenuItem key={size} onSelect={() => setPerPage(size)}>
                {size}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isDesktop ? (
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map(col => (
                <TableHead
                  key={String(col.key)}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={col.sortable ? "cursor-pointer select-none" : ""}
                >
                  {col.label} {sortKey === col.key ? (sortAsc ? "▲" : "▼") : ""}
                </TableHead>
              ))}
              {actions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(row => (
              <TableRow key={row[rowIdKey]}>
                {visibleColumns.map(col => (
                  <TableCell key={String(col.key)}>
                    {col.render ? col.render(row) : row[col.key]}
                  </TableCell>
                ))}
                {actions && <TableCell>{actions(row)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {paginated.map(row => (
            <AccordionItem key={row[rowIdKey]} value={String(row[rowIdKey])}>
              <AccordionTrigger>{row[visibleColumns[0].key]}</AccordionTrigger>
              <AccordionContent className="space-y-1 text-sm">
                {visibleColumns.slice(1).map(col => (
                  <div key={String(col.key)} className="flex justify-between">
                    <span className="font-medium">{col.label}</span>
                    <span>{col.render ? col.render(row) : row[col.key]}</span>
                  </div>
                ))}
                {actions && <div className="pt-2">{actions(row)}</div>}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {maxPage}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(maxPage, p + 1))}
            disabled={currentPage === maxPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
