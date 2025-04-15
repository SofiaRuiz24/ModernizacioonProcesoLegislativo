import React, { forwardRef } from 'react';
const Table = forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(({
  className,
  ...props
}, ref) => <div className="relative w-full overflow-auto">
    <table ref={ref} className="w-full caption-bottom text-sm" {...props} />
  </div>);
Table.displayName = 'Table';
const TableHeader = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({
  className,
  ...props
}, ref) => <thead ref={ref} className="border-b bg-muted/50" {...props} />);
TableHeader.displayName = 'TableHeader';
const TableBody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({
  className,
  ...props
}, ref) => <tbody ref={ref} className="divide-y" {...props} />);
TableBody.displayName = 'TableBody';
const TableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({
  className,
  ...props
}, ref) => <tr ref={ref} className="hover:bg-muted/50 data-[state=selected]:bg-muted" {...props} />);
TableRow.displayName = 'TableRow';
const TableHead = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({
  className,
  ...props
}, ref) => <th ref={ref} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground" {...props} />);
TableHead.displayName = 'TableHead';
const TableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({
  className,
  ...props
}, ref) => <td ref={ref} className="p-4 align-middle" {...props} />);
TableCell.displayName = 'TableCell';
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };