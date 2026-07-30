import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Yatay taşan geniş tabloları saran kaydırma kabına uygulanır; `className` yalnızca `<table>`'ı hedefler. */
  containerClassName?: string;
}

/**
 * Native `<table>` üzerine kurulu birincil bileşen. Dar ekranlarda tablo taştığında sayfanın
 * tamamı yerine yalnızca tablonun kendi içinde yatay kaydırma olsun diye bir sarmalayıcıyla
 * gelir — `TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell` ile birlikte kullanılır.
 *
 * Yükleniyor durumu için satırları `Skeleton` ile, boş durum için `colSpan` veren tek bir
 * satır içinde `EmptyState` ile doldurun (bkz. README "Table" bölümü) — bu bileşen kendi
 * başına bir yükleniyor/boş görünüm dayatmaz, kompozisyonla çözülür.
 */
export function Table({ className, containerClassName, ...props }: TableProps) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-border-soft", containerClassName)}>
      <table className={cn("w-full min-w-max text-left text-sm", className)} {...props} />
    </div>
  );
}

export function TableCaption({ className, ...props }: HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption className={cn("px-4 py-3 text-left text-sm text-zinc-500 dark:text-zinc-400", className)} {...props} />
  );
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "border-b border-border-soft bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-400",
        className,
      )}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-border-soft", className)} {...props} />;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Satır seçili/vurgulanmış görünsün mü (ör. toplu işlem checkbox'ıyla seçilmiş bir satır). */
  selected?: boolean;
}

export function TableRow({ className, selected, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40",
        selected && "bg-brand/5 hover:bg-brand/5",
        className,
      )}
      {...props}
    />
  );
}

function SortIcon({ direction }: { direction?: "asc" | "desc" | false }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0"
    >
      {direction === "asc" ? (
        <path d="m6 15 6-6 6 6" />
      ) : direction === "desc" ? (
        <path d="m6 9 6 6 6-6" />
      ) : (
        <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
      )}
    </svg>
  );
}

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** Verilirse (`onSort` ile birlikte) sütun sıralama yönünü gösterir. */
  sortDirection?: "asc" | "desc" | false;
  /** Verilirse başlık tıklanabilir bir butona döner ve sütun sıralanabilir olur. */
  onSort?: () => void;
}

/**
 * Sütun başlığı. `onSort` verilirse WAI-ARIA'nın sıralanabilir tablo desenine göre `aria-sort`
 * `<th>` üzerine, tıklama ise iç `<button>` üzerine bağlanır (`<th>`'nin kendisi tıklanabilir
 * yapılmaz — etkileşimli eleman her zaman gerçek bir buton olmalı).
 */
export function TableHead({ className, children, sortDirection, onSort, ...props }: TableHeadProps) {
  const isSortable = Boolean(onSort);
  const ariaSort = isSortable
    ? sortDirection === "asc"
      ? "ascending"
      : sortDirection === "desc"
        ? "descending"
        : "none"
    : undefined;

  return (
    <th scope="col" aria-sort={ariaSort} className={cn("px-4 py-3 font-semibold", className)} {...props}>
      {isSortable ? (
        <button
          type="button"
          onClick={onSort}
          className="inline-flex items-center gap-1 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:hover:text-zinc-100"
        >
          {children}
          <SortIcon direction={sortDirection} />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "center" | "right";
}

export function TableCell({ className, align = "left", ...props }: TableCellProps) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-zinc-700 dark:text-zinc-300",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
      {...props}
    />
  );
}
