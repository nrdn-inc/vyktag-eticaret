// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("içeriği render eder", () => {
    render(<Badge>Tükendi</Badge>);
    expect(screen.getByText("Tükendi")).toBeInTheDocument();
  });

  it("harici className'i korur (tailwind-merge çakışmayı çözer)", () => {
    render(<Badge className="ml-2">Yeni</Badge>);
    expect(screen.getByText("Yeni")).toHaveClass("ml-2");
  });

  it("variant=accent dolu vurgu rengi kullanır (ürün görseli üzerindeki pazarlama rozetleri için)", () => {
    render(<Badge variant="accent">En çok satan</Badge>);
    expect(screen.getByText("En çok satan")).toHaveClass("bg-accent", "text-white");
  });
});
