"use client";

import { useEffect, useId, useRef } from "react";
import type { KeyboardEvent, ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useIsMounted } from "@/lib/use-is-mounted";

const SIZE_MAP = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-[calc(100vw-2rem)]",
} as const;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Görsel bir başlık yoksa erişilebilir ada karar vermek için zorunludur. */
  ariaLabel?: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof SIZE_MAP;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  /** Açılışta odağın gideceği eleman; verilmezse içerideki ilk odaklanabilir eleman kullanılır. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * Erişilebilir modal/dialog: focus trap, ESC ile kapatma, arka plana tıklayınca kapatma,
 * body scroll kilidi ve kapanışta tetikleyici elemana odak dönüşü içerir. `document.body`'ye
 * portallanır; bu yüzden yalnızca istemcide (mount sonrası) render edilir.
 *
 * Not: Aynı anda iç içe birden fazla Modal açarsanız scroll-kilit geri yüklemesi en dıştaki
 * kapanışta tetiklenir — iç içe modal senaryosu için ayrı bir kilit sayacı gerekir, bu temel
 * sürümde yok.
 */
export function Modal({
  open,
  onClose,
  title,
  ariaLabel,
  description,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEsc = true,
  initialFocusRef,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  // `document.body` sunucuda yok; portal ancak istemcide mount olduktan sonra kurulur.
  const mounted = useIsMounted();

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    // Odak önce içerik/footer'daki (uygulamanın verdiği) ilk elemana gider; modal'ın kendi
    // "Kapat" (X) butonu gibi çerçeve elemanları burada aday sayılmaz — kullanıcı açılışta
    // doğrudan asıl içerikle karşılaşır, kapatma kontrolüyle değil.
    const target =
      initialFocusRef?.current ??
      contentRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ??
      dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ??
      dialogRef.current;
    target?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialFocusRef bir ref, kimlik değişmez
  }, [open]);

  if (!open || !mounted) {
    return null;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (closeOnEsc && event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!focusable || focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      <div
        aria-hidden="true"
        onClick={closeOnOverlayClick ? onClose : undefined}
        className="animate-vyk-overlay-in fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ? undefined : ariaLabel}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "animate-vyk-modal-in relative w-full rounded-2xl border border-border-soft bg-surface p-6 shadow-2xl outline-none",
          SIZE_MAP[size],
          className,
        )}
      >
        {title && (
          <h2 id={titleId} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
        )}
        {description && (
          <p id={descriptionId} className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-5 w-5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div ref={contentRef}>
          <div className={cn(title || description ? "mt-4" : undefined)}>{children}</div>
          {footer && <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>}
        </div>
      </div>
    </div>,
    document.body,
  );
}
