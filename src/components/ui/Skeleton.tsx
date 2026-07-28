import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

/**
 * İçerik yüklenirken yerini tutan iskelet. `aria-hidden` — bu tamamen görsel bir ipucudur;
 * gerçek yükleme durumunun anlaşılır bir duyurusu için etrafındaki bileşende
 * `aria-busy`/`role="status"` kullanın (bkz. README "Yükleme durumları").
 */
export function Skeleton({ variant = "text", width, height, className, style, ...props }: SkeletonProps) {
  const shapeClass =
    variant === "circular" ? "rounded-full" : variant === "text" ? "rounded-md" : "rounded-lg";
  const defaultHeight = variant === "text" ? "1em" : undefined;

  const computedStyle: CSSProperties = {
    width,
    height: height ?? defaultHeight,
    ...style,
  };

  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800", shapeClass, className)}
      style={computedStyle}
      {...props}
    />
  );
}

export interface SkeletonTextProps extends Omit<SkeletonProps, "variant" | "width"> {
  /** Kaç satır gösterileceği. Son satır, gerçek metnin son satırının kısa olma eğilimini taklit etmek için daha dar render edilir. */
  lines?: number;
}

/** Birden çok satırlık paragraf yer tutucusu — kart açıklamaları, liste öğeleri vb. için. */
export function SkeletonText({ lines = 3, className, ...props }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 && lines > 1 ? "70%" : "100%"}
          {...props}
        />
      ))}
    </div>
  );
}
