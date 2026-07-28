import { forwardRef } from "react";
import type { InputEvent, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { fieldVariants } from "./Input";
import { FieldShell, useFieldIds } from "./field-shell";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  label?: string;
  description?: string;
  error?: string;
  fieldSize?: "sm" | "md" | "lg";
  containerClassName?: string;
  /** Girilen içeriğe göre yüksekliği otomatik büyütür (satır sonuna kadar kaydırma çubuğu göstermez). */
  autoResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    description,
    error,
    fieldSize = "md",
    className,
    containerClassName,
    id,
    required,
    autoResize = false,
    onInput,
    rows = 4,
    ...props
  },
  ref,
) {
  const { fieldId, descriptionId, errorId, describedBy } = useFieldIds(id, description, error);

  function handleInput(event: InputEvent<HTMLTextAreaElement>) {
    if (autoResize) {
      const el = event.currentTarget;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
    onInput?.(event);
  }

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
      <textarea
        ref={ref}
        id={fieldId}
        required={required}
        rows={rows}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        onInput={handleInput}
        className={cn(
          fieldVariants({ fieldSize, invalid: Boolean(error) }),
          "resize-y",
          autoResize && "resize-none overflow-hidden",
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
});
