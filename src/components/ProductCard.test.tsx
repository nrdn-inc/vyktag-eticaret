// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductCard } from "@/components/ProductCard";
import type { ProductWithVariants } from "@/lib/catalog";

const singleVariant: ProductWithVariants = {
  id: "p1",
  slug: "vyktag-tag",
  name: "VYKTag Tag",
  description: "Kompakt NFC etiket.",
  minPriceKurus: 39990,
  variants: [
    { id: "v1", name: "Standart", sku: "VYK-TAG-STD", priceKurus: 39990, stock: 10, attributes: null, images: [] },
  ],
  durationOptions: [],
  subscriptionFirstCardAddon: null,
};

const multiVariant: ProductWithVariants = {
  id: "p2",
  slug: "vyktag-kart",
  name: "VYKTag Kart",
  description: "NFC kart.",
  minPriceKurus: 59990,
  variants: [
    { id: "v2", name: "Siyah", sku: "VYK-KART-SIYAH", priceKurus: 59990, stock: 10, attributes: null, images: [] },
    { id: "v3", name: "Özel", sku: "VYK-KART-CUSTOM", priceKurus: 79990, stock: 5, attributes: null, images: [] },
  ],
  durationOptions: [],
  subscriptionFirstCardAddon: null,
};

const outOfStock: ProductWithVariants = {
  ...singleVariant,
  id: "p3",
  slug: "vyktag-phonecard",
  name: "VYKTag Phonecard",
  variants: [
    { id: "v4", name: "Standart", sku: "VYK-PHONE-STD", priceKurus: 44990, stock: 0, attributes: null, images: [] },
  ],
};

describe("ProductCard", () => {
  it("shows a single fixed price without a starting-from label", () => {
    render(<ProductCard product={singleVariant} />);

    expect(screen.getByRole("heading", { name: "VYKTag Tag" })).toBeInTheDocument();
    expect(screen.getByText("₺399,90")).toBeInTheDocument();
    expect(screen.queryByText("başlangıç fiyatı")).not.toBeInTheDocument();
  });

  it("marks the price as a starting point for multi-variant products", () => {
    render(<ProductCard product={multiVariant} />);

    expect(screen.getByText("₺599,90")).toBeInTheDocument();
    expect(screen.getByText("başlangıç fiyatı")).toBeInTheDocument();
  });

  it("lists the available variant names for multi-variant products", () => {
    render(<ProductCard product={multiVariant} />);

    expect(screen.getByText("Siyah")).toBeInTheDocument();
    expect(screen.getByText("Özel")).toBeInTheDocument();
  });

  it("links the whole card to the product detail page", () => {
    render(<ProductCard product={singleVariant} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/urunler/vyktag-tag");
  });

  it("shows the campaign badge configured for the product slug", () => {
    render(<ProductCard product={multiVariant} />);
    expect(screen.getByText("En çok satan")).toBeInTheDocument();
  });

  it("flags products whose variants are all out of stock", () => {
    render(<ProductCard product={outOfStock} />);
    expect(screen.getByText("Tükendi")).toBeInTheDocument();
  });
});
