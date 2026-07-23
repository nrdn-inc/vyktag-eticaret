"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";

/** Header'daki sepet bağlantısı ve ürün adedi rozeti. */
export function CartLink() {
  const { itemCount, ready } = useCart();

  return (
    <Link
      href="/sepet"
      className="relative flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold transition-colors hover:border-brand hover:text-brand dark:border-zinc-700"
      aria-label={`Sepet (${itemCount} ürün)`}
    >
      Sepet
      {ready && itemCount > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-bold text-white">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
