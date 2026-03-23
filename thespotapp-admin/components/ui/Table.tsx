"use client";

import { clsx } from "clsx";

interface TableProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={clsx("w-full text-sm text-left", className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className }: TableProps) {
  return (
    <thead
      className={clsx("bg-gray-50 text-gray-600 uppercase text-xs", className)}
    >
      {children}
    </thead>
  );
}

export function TableBody({ children, className }: TableProps) {
  return <tbody className={clsx("divide-y divide-gray-200", className)}>{children}</tbody>;
}

export function TableRow({ children, className }: TableProps) {
  return (
    <tr className={clsx("hover:bg-gray-50 transition-colors", className)}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className }: TableProps) {
  return (
    <th className={clsx("px-4 py-3 font-medium", className)}>{children}</th>
  );
}

export function TableCell({ children, className, colSpan }: TableProps) {
  return (
    <td colSpan={colSpan} className={clsx("px-4 py-3 text-gray-700", className)}>{children}</td>
  );
}
