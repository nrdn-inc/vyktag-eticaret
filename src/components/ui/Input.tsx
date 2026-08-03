import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { FieldShell, useFieldIds } from "./field-shell";

export const fieldVariants = cva(
  [
    "w-full rounded-lg border bg-white text-sm text-zinc-900 outline-none transition-colors",
    "placeholder:text-zinc-400",
    "focus:border-brand focus:ring-1 focus:ring-brand",
    "disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-60",
    "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:disabled:bg-zinc-950",
  ].join(" "),
  {
    variants: {
      fieldSize: {
        sm: "px-2.5 py-1.5 text-xs",
        md: "px-3 py-2",
        lg: "px-4 py-3 text-base",
      },
      invalid: {
        true: "border-red-500 focus:border-red-500 focus:ring-red-500",
        false: "border-zinc-300",
      },
    },
    defaultVariants: { fieldSize: "md", invalid: false },
  },
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    Pick<VariantProps<typeof fieldVariants>, "fieldSize"> {
  label?: ReactNode;
  description?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Dış sarmalayıcıya (label + input + hata) uygulanır; `className` yalnızca `<input>` elemanını hedefler. */
  containerClassName?: string;
}

/**
 * Metin girişi. Label/description/error otomatik olarak aria-describedby + aria-invalid'e
 * bağlanır — bu bağlamayı elle kurmanız gerekmez, `error` prop'unu vermeniz yeterlidir.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    description,
    error,
    fieldSize = "md",
    leftIcon,
    rightIcon,
    className,
    containerClassName,
    id,
    required,
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
        {leftIcon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400"
          >
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            fieldVariants({ fieldSize, invalid: Boolean(error) }),
            leftIcon && "pl-9",
            rightIcon && "pr-9",
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400"
          >
            {rightIcon}
          </span>
        )}
      </div>
    </FieldShell>
  );
});
