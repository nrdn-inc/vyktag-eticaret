// @vitest-environment jsdom
import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children and defaults to type=button (formların içinde yanlışlıkla submit tetiklememek için)", () => {
    render(<Button>Kaydet</Button>);
    const button = screen.getByRole("button", { name: "Kaydet" });
    expect(button).toHaveAttribute("type", "button");
  });

  it("explicit type prop'unu korur", () => {
    render(<Button type="submit">Gönder</Button>);
    expect(screen.getByRole("button", { name: "Gönder" })).toHaveAttribute("type", "submit");
  });

  it("onClick çağrılır", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Tıkla</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Tıkla" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("loading=true iken devre dışı kalır, aria-busy işaretlenir ve tıklama tetiklenmez", () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Kaydet
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Kaydet" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("loadingText verilirse children yerine onu gösterir", () => {
    render(
      <Button loading loadingText="Kaydediliyor…">
        Kaydet
      </Button>,
    );
    expect(screen.getByRole("button")).toHaveTextContent("Kaydediliyor…");
    expect(screen.queryByText("Kaydet")).not.toBeInTheDocument();
  });

  it("disabled prop'u ile devre dışı kalır", () => {
    render(<Button disabled>Kaydet</Button>);
    expect(screen.getByRole("button", { name: "Kaydet" })).toBeDisabled();
  });

  it("ref'i gerçek DOM elemanına iletir", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Kaydet</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("harici className, varyant class'larıyla çakışsa bile korunur (tailwind-merge)", () => {
    render(<Button className="mt-4">Kaydet</Button>);
    expect(screen.getByRole("button")).toHaveClass("mt-4");
  });

  it("variant=muted nötr kenarlık kullanır ve hover'da dolgu değil marka rengine döner", () => {
    render(<Button variant="muted">Vazgeç</Button>);
    const button = screen.getByRole("button", { name: "Vazgeç" });
    expect(button).toHaveClass("border-zinc-300");
    expect(button).toHaveClass("hover:border-brand");
    expect(button).not.toHaveClass("hover:bg-brand");
  });
});
