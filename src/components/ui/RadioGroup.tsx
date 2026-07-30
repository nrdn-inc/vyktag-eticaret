import { useId } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface RadioOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Aynı gruptaki tüm radio'ları birbirine bağlar; native ok tuşu gezinmesi bunun üzerinden çalışır. */
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: ReactNode;
  description?: string;
  error?: string;
  orientation?: "vertical" | "horizontal";
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * `<fieldset>` + `<legend>` üzerine kurulu native radio grubu — özel bir `role="radiogroup"`
 * yeniden icat edilmiyor; ok tuşlarıyla gezinme, `Select` gibi platformun kendi davranışı.
 * `Select`'in `options`/`value`/`onChange` API şekliyle bilinçli olarak tutarlı tutuldu.
 */
export function RadioGroup({
  name,
  options,
  value,
  onChange,
  label,
  description,
  error,
  orientation = "vertical",
  required,
  disabled,
  className,
}: RadioGroupProps) {
  const generatedId = useId();
  const hasError = Boolean(error);
  const hasDescription = Boolean(description) && !hasError;
  const descriptionId = hasDescription ? `${generatedId}-description` : undefined;
  const errorId = hasError ? `${generatedId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset
      className={cn("space-y-2.5", className)}
      aria-describedby={describedBy}
      aria-invalid={hasError || undefined}
    >
      {label && (
        <legend className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-red-600">
              *
            </span>
          )}
        </legend>
      )}
      <div className={cn("flex gap-x-5 gap-y-2.5", orientation === "vertical" ? "flex-col" : "flex-wrap")}>
        {options.map((option) => {
          const optionId = `${generatedId}-${option.value}`;
          const optionDisabled = disabled || option.disabled;
          return (
            <div key={option.value} className="flex items-center gap-2.5">
              <input
                type="radio"
                id={optionId}
                name={name}
                value={option.value}
                checked={value === option.value}
                disabled={optionDisabled}
                onChange={() => onChange?.(option.value)}
                className={cn(
                  "h-4 w-4 shrink-0 cursor-pointer border-zinc-300 accent-brand",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "dark:border-zinc-700",
                )}
              />
              <label
                htmlFor={optionId}
                className={cn(
                  "select-none text-sm text-zinc-900 dark:text-zinc-100",
                  optionDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                )}
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : description ? (
        <p id={descriptionId} className="text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      ) : null}
    </fieldset>
  );
}
