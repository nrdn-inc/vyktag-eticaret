import { forwardRef } from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { fieldVariants } from "./Input";
import { FieldShell, useFieldIds } from "./field-shell";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: ReactNode;
  description?: string;
  error?: string;
  fieldSize?: "sm" | "md" | "lg";
  containerClassName?: string;
  options: SelectOption[];
  /** Seçilebilir bir "boş" ilk seçenek ekler (ör. "Seçiniz"). Verilirse value="" ile eşleşir. */
  placeholder?: string;
}

/**
 * Native `<select>` üzerine kurulu — özel bir listbox yeniden icat edilmiyor. Bu, klavye
 * gezinme, ekran okuyucu davranışı ve mobil dokunmatik seçicilerin platformun kendi,
 * yıllarca test edilmiş uygulamasını kullanmak anlamına gelir; üretimde en az sürpriz
 * çıkaran seçim budur.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    description,
    error,
    fieldSize = "md",
    className,
    containerClassName,
    id,
    required,
    options,
    placeholder,
    ...props
  },
  ref,
) {
  const { fieldId, descriptionId, errorId, describedBy } = useFieldIds(id, description, error);

  return (
    <FieldShell
      fieldId={fieldId}
      label={label}
      required={required}
      description={description}
      descriptionId={descriptionId}
      error={error}
      errorId={errorId}
      className={containerClassName}
    >
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            fieldVariants({ fieldSize, invalid: Boolean(error) }),
            "appearance-none pr-9",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-zinc-400"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </FieldShell>
  );
});
