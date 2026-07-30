import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type PaginationItem = number | "ellipsis";

export interface PaginationRangeOptions {
  siblingCount?: number;
}

/**
 * Saf fonksiyon: mevcut sayfa etrafında hangi sayfa numaralarının gösterileceğini ve nerede
 * "…" (ellipsis) konacağını hesaplar. `Pagination`'dan ayrı tutulur — hem bileşenden bağımsız
 * test edilebilir hem de tamamen farklı bir görünüm gerektiğinde yeniden kullanılabilir.
 */
export function getPaginationRange(
  page: number,
  totalPages: number,
  { siblingCount = 1 }: PaginationRangeOptions = {},
): PaginationItem[] {
  if (totalPages <= 0) return [];

  const pages = new Set<number>([1, totalPages]);
  for (let p = page - siblingCount; p <= page + siblingCount; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const items: PaginationItem[] = [];
  sorted.forEach((current, index) => {
    if (index > 0 && current - sorted[index - 1] > 1) {
      items.push("ellipsis");
    }
    items.push(current);
  });
  return items;
}

interface PaginationLinkRenderProps {
  page: number;
  href: string;
  className: string;
  "aria-current"?: "page";
  "aria-label"?: string;
  children: ReactNode;
}

export interface PaginationProps {
  /** 1 tabanlı mevcut sayfa. */
  page: number;
  totalPages: number;
  /** Buton modu: bir sayfaya tıklanınca çağrılır. */
  onPageChange?: (page: number) => void;
  /** Bağlantı modu: her sayfa için href üretir, öğeler `<a>` olarak render edilir. */
  hrefFor?: (page: number) => string;
  /**
   * `hrefFor` ile birlikte, düz `<a>` yerine özel bir eleman render etmek için — ör. `next/link`'in
   * `Link`'ini saran bir bileşen, istemci taraflı gezinme/prefetch kazanmak isteyen sayfalarda.
   */
  renderLink?: (props: PaginationLinkRenderProps) => ReactNode;
  /** Mevcut sayfanın her iki yanında gösterilecek komşu sayfa adedi. */
  siblingCount?: number;
  className?: string;
  "aria-label"?: string;
}

const itemBaseClass = cn(
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
);
const itemInactiveClass = "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800";
const itemActiveClass = "bg-brand text-white hover:bg-brand";
const itemDisabledClass = "pointer-events-none text-zinc-300 dark:text-zinc-700";

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d={direction === "left" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
    </svg>
  );
}

/**
 * Sayfa numaralarını + önceki/sonraki oklarını render eder. `hrefFor` verilirse gezinme
 * bağlantılar üzerinden (SEO-dostu, JS gerektirmeden çalışır) yapılır; `onPageChange` verilirse
 * butonlarla kontrollü çalışır. `totalPages <= 1` iken hiçbir şey render etmez — tek sayfalık
 * bir listede sayfalama göstermek kullanıcıya yanıltıcı bir sinyal verir.
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  hrefFor,
  renderLink,
  siblingCount = 1,
  className,
  "aria-label": ariaLabel = "Sayfalama",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = getPaginationRange(page, totalPages, { siblingCount });

  function renderItem(
    targetPage: number,
    children: ReactNode,
    options: { isCurrent?: boolean; disabled?: boolean; label?: string } = {},
  ) {
    const { isCurrent = false, disabled = false, label } = options;
    const itemClassName = cn(itemBaseClass, isCurrent ? itemActiveClass : itemInactiveClass, disabled && itemDisabledClass);

    if (disabled) {
      return (
        <span aria-hidden="true" className={itemClassName}>
          {children}
        </span>
      );
    }

    if (hrefFor) {
      const href = hrefFor(targetPage);
      const linkProps: PaginationLinkRenderProps = {
        page: targetPage,
        href,
        className: itemClassName,
        "aria-current": isCurrent ? "page" : undefined,
        "aria-label": label,
        children,
      };
      return renderLink ? (
        renderLink(linkProps)
      ) : (
        <a href={href} className={itemClassName} aria-current={isCurrent ? "page" : undefined} aria-label={label}>
          {children}
        </a>
      );
    }

    return (
      <button
        type="button"
        className={itemClassName}
        aria-current={isCurrent ? "page" : undefined}
        aria-label={label}
        onClick={() => onPageChange?.(targetPage)}
      >
        {children}
      </button>
    );
  }

  return (
    <nav aria-label={ariaLabel} className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {renderItem(page - 1, <ChevronIcon direction="left" />, { disabled: page <= 1, label: "Önceki sayfa" })}
      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} aria-hidden="true" className="px-1 text-sm text-zinc-400 dark:text-zinc-600">
            …
          </span>
        ) : (
          <span key={item}>{renderItem(item, item, { isCurrent: item === page, label: `Sayfa ${item}` })}</span>
        ),
      )}
      {renderItem(page + 1, <ChevronIcon direction="right" />, { disabled: page >= totalPages, label: "Sonraki sayfa" })}
    </nav>
  );
}
