"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { Badge, buttonVariants } from "@/components/ui";
import { cn } from "@/lib/cn";

/** Header'daki sepet bağlantısı ve ürün adedi rozeti. */
export function CartLink() {
  const { itemCount, ready } = useCart();

  return (
    <Link
      href="/sepet"
      className={cn(buttonVariants({ variant: "muted", size: "sm" }), "relative gap-2 px-4 py-2")}
      aria-label={`Sepet (${itemCount} ürün)`}
    >
      Sepet
      {/* `neutral` varyantın karanlık moda özel dark:bg-zinc-800'ü, yalnızca ışık modu için
          verilen bir bg-brand override'ıyla çakışan sayılmaz (tailwind-merge bunları farklı
          koşullar için kasıtlı görür) — bu yüzden karanlık mod için de açıkça verilmesi gerekir. */}
      {ready && itemCount > 0 && (
        <Badge size="sm" className="h-5 min-w-5 justify-center bg-brand px-1.5 text-white dark:bg-brand dark:text-white">
          {itemCount}
        </Badge>
      )}
    </Link>
  );
}
