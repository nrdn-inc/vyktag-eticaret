import { useId } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface FieldA11yIds {
  fieldId: string;
  descriptionId: string | undefined;
  errorId: string | undefined;
  /** input/textarea/select'in aria-describedby'sine olduğu gibi verilir. */
  describedBy: string | undefined;
}

/**
 * Input/Textarea/Select arasında paylaşılan id + aria-describedby üretimi. `id` verilmezse
 * `useId` ile kararlı bir kimlik üretilir (SSR/CSR arasında tutarlı, React 18+ gereksinimi).
 *
 * Hata varken açıklama metni `FieldShell` tarafından gösterilmez (bkz. aşağısı) — bu yüzden
 * "açıklama gerçekten görünüyor mu" kuralı burada, tek yerde karara bağlanır; her çağıran
 * yerde `Boolean(description) && !error` tekrarlamak yerine.
 */
export function useFieldIds(idProp: string | undefined, description: unknown, error: unknown): FieldA11yIds {
  const generatedId = useId();
  const fieldId = idProp ?? generatedId;
  const hasError = Boolean(error);
  const hasDescription = Boolean(description) && !hasError;
  const descriptionId = hasDescription ? `${fieldId}-description` : undefined;
  const errorId = hasError ? `${fieldId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  return { fieldId, descriptionId, errorId, describedBy };
}

interface FieldShellProps extends Pick<FieldA11yIds, "fieldId" | "descriptionId" | "errorId"> {
  label?: ReactNode;
  required?: boolean;
  description?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Input/Textarea/Select'in ortak dış çerçevesi: label, açıklama ve hata metni.
 * Hata varsa açıklamanın yerini alır (ikisi aynı anda gösterilmez, dikey alan sabit kalır).
 */
export function FieldShell({
  fieldId,
  label,
  required,
  description,
  descriptionId,
  error,
  errorId,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-red-600">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : description ? (
        <p id={descriptionId} className="text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      ) : null}
    </div>
  );
}
