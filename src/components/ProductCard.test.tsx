// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductCard } from "@/components/ProductCard";
import type { ProductWithVariants } from "@/lib/catalog";

const singleVariant: ProductWithVariants = {
  id: "p1",
  slug: "vyktag-tag",
  name: "Vyktag Tag",
  description: "Kompakt NFC etiket.",
  minPriceKurus: 39990,
  variants: [{ id: "v1", name: "Standart", sku: "VYK-TAG-STD", priceKurus: 39990, stock: 10 }],
};

const multiVariant: ProductWithVariants = {
  id: "p2",
  slug: "vyktag-kart",
  name: "Vyktag Kart",
  description: "NFC kart.",
  minPriceKurus: 59990,
  variants: [
    { id: "v2", name: "Siyah", sku: "VYK-KART-SIYAH", priceKurus: 59990, stock: 10 },
    { id: "v3", name: "Özel", sku: "VYK-KART-CUSTOM", priceKurus: 79990, stock: 5 },
  ],
};

describe("ProductCard", () => {
  it("shows a single fixed price for single-variant products", () => {
    render(<ProductCard product={singleVariant} />);
    expect(screen.getByRole("heading", { name: "Vyktag Tag" })).toBeInTheDocument();
    expect(screen.getByText("₺399,90")).toBeInTheDocument();
  });

  it("shows a starting-from price for multi-variant products", () => {
    render(<ProductCard product={multiVariant} />);
    expect(screen.getByText(/₺599,90'den başlayan/)).toBeInTheDocument();
  });
});
