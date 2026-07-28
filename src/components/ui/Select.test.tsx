// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

const OPTIONS = [
  { value: "kart", label: "Vyktag Kart" },
  { value: "tag", label: "Vyktag Tag" },
];

describe("Select", () => {
  it("seçenekleri render eder ve label'a bağlanır", () => {
    render(<Select label="Ürün" options={OPTIONS} />);
    const select = screen.getByLabelText("Ürün");
    expect(select).toBeInstanceOf(HTMLSelectElement);
    expect(screen.getByRole("option", { name: "Vyktag Kart" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Vyktag Tag" })).toBeInTheDocument();
  });

  it("placeholder verilirse devre dışı bir boş seçenek ekler", () => {
    render(<Select label="Ürün" options={OPTIONS} placeholder="Seçiniz" required />);
    const placeholderOption = screen.getByRole("option", { name: "Seçiniz" }) as HTMLOptionElement;
    expect(placeholderOption.disabled).toBe(true);
    expect(placeholderOption.value).toBe("");
  });

  it("onChange ile seçim değişikliği yakalanır", () => {
    const onChange = vi.fn();
    render(<Select label="Ürün" options={OPTIONS} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Ürün"), { target: { value: "tag" } });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("error verildiğinde aria-invalid ve alert bağlanır", () => {
    render(<Select label="Ürün" options={OPTIONS} error="Bir ürün seçin" />);
    expect(screen.getByLabelText("Ürün")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Bir ürün seçin");
  });
});
