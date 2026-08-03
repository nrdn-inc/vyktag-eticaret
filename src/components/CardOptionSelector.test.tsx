// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CardOptionSelector } from "@/components/CardOptionSelector";
import type { ProductWithVariants } from "@/lib/catalog";

// VYKTag Kart'ın gerçek 8 varyantlık seed yapısının küçültülmüş bir kopyası.
const VARIANTS: ProductWithVariants["variants"] = [
  { id: "siyah-gumus", name: "Siyah · Gümüş Baskı", sku: "A", priceKurus: 59990, stock: 10, attributes: { cardColor: "Siyah", printColor: "Gümüş", customDesign: false }, images: [] },
  { id: "siyah-gumus-ozel", name: "Siyah · Gümüş Baskı · Özel Tasarım", sku: "B", priceKurus: 79990, stock: 5, attributes: { cardColor: "Siyah", printColor: "Gümüş", customDesign: true }, images: [] },
  { id: "siyah-altin", name: "Siyah · Altın Baskı", sku: "C", priceKurus: 59990, stock: 10, attributes: { cardColor: "Siyah", printColor: "Altın", customDesign: false }, images: [] },
  { id: "siyah-altin-ozel", name: "Siyah · Altın Baskı · Özel Tasarım", sku: "D", priceKurus: 79990, stock: 5, attributes: { cardColor: "Siyah", printColor: "Altın", customDesign: true }, images: [] },
  { id: "beyaz-siyah", name: "Beyaz · Siyah Baskı", sku: "E", priceKurus: 59990, stock: 10, attributes: { cardColor: "Beyaz", printColor: "Siyah", customDesign: false }, images: [] },
  { id: "beyaz-siyah-ozel", name: "Beyaz · Siyah Baskı · Özel Tasarım", sku: "F", priceKurus: 79990, stock: 5, attributes: { cardColor: "Beyaz", printColor: "Siyah", customDesign: true }, images: [] },
  { id: "beyaz-altin", name: "Beyaz · Altın Baskı", sku: "G", priceKurus: 59990, stock: 10, attributes: { cardColor: "Beyaz", printColor: "Altın", customDesign: false }, images: [] },
  { id: "beyaz-altin-ozel", name: "Beyaz · Altın Baskı · Özel Tasarım", sku: "H", priceKurus: 79990, stock: 5, attributes: { cardColor: "Beyaz", printColor: "Altın", customDesign: true }, images: [] },
];

describe("CardOptionSelector", () => {
  it("switches to the white-card variant with the same print color when card color changes", () => {
    const onSelect = vi.fn();
    render(<CardOptionSelector variants={VARIANTS} selectedVariantId="siyah-altin" onSelect={onSelect} onLogoChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Beyaz" }));
    expect(onSelect).toHaveBeenCalledWith("beyaz-altin");
  });

  it("falls back to the first available print color when the current one doesn't exist for the new card color", () => {
    const onSelect = vi.fn();
    render(<CardOptionSelector variants={VARIANTS} selectedVariantId="siyah-gumus" onSelect={onSelect} onLogoChange={vi.fn()} />);

    // Beyaz'da "Gümüş Baskı" yok — sıradaki uygun seçenek olan "Altın Baskı"ya düşmeli.
    fireEvent.click(screen.getByRole("button", { name: "Beyaz" }));
    expect(onSelect).toHaveBeenCalledWith("beyaz-altin");
  });

  it("preserves the custom design flag when switching print color", () => {
    const onSelect = vi.fn();
    render(<CardOptionSelector variants={VARIANTS} selectedVariantId="siyah-gumus-ozel" onSelect={onSelect} onLogoChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Altın Baskı" }));
    expect(onSelect).toHaveBeenCalledWith("siyah-altin-ozel");
  });

  it("toggles custom design on and off for the same card/print color", () => {
    const onSelect = vi.fn();
    render(<CardOptionSelector variants={VARIANTS} selectedVariantId="beyaz-altin" onSelect={onSelect} onLogoChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("checkbox"));
    expect(onSelect).toHaveBeenCalledWith("beyaz-altin-ozel");
  });

  it("only offers the print colors that exist for the currently selected card color", () => {
    render(<CardOptionSelector variants={VARIANTS} selectedVariantId="beyaz-siyah" onSelect={vi.fn()} onLogoChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: /Siyah Baskı/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Altın Baskı/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Gümüş Baskı/ })).not.toBeInTheDocument();
  });

  it("only shows the logo upload control when custom design is selected", () => {
    const { rerender } = render(
      <CardOptionSelector variants={VARIANTS} selectedVariantId="beyaz-altin" onSelect={vi.fn()} onLogoChange={vi.fn()} />,
    );
    expect(screen.queryByText("Logo yükle")).not.toBeInTheDocument();

    rerender(
      <CardOptionSelector variants={VARIANTS} selectedVariantId="beyaz-altin-ozel" onSelect={vi.fn()} onLogoChange={vi.fn()} />,
    );
    expect(screen.getByText("Logo yükle")).toBeInTheDocument();
  });

  it("clears the uploaded logo when custom design is unchecked", () => {
    const onLogoChange = vi.fn();
    render(
      <CardOptionSelector
        variants={VARIANTS}
        selectedVariantId="beyaz-altin-ozel"
        onSelect={vi.fn()}
        logoDataUrl="data:image/png;base64,AAAA"
        onLogoChange={onLogoChange}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox"));
    expect(onLogoChange).toHaveBeenCalledWith(undefined);
  });
});
