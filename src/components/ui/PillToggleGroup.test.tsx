// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PillToggleGroup } from "./PillToggleGroup";

const OPTIONS = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
  { value: "c", label: "C", disabled: true },
];

describe("PillToggleGroup", () => {
  it("her seçeneği bir buton olarak render eder", () => {
    render(<PillToggleGroup options={OPTIONS} value="a" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "A" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "B" })).toBeInTheDocument();
  });

  it("seçili seçenek aria-pressed=true taşır, diğerleri false", () => {
    render(<PillToggleGroup options={OPTIONS} value="a" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "B" })).toHaveAttribute("aria-pressed", "false");
  });

  it("tıklanınca onChange seçilen değerle çağrılır", () => {
    const onChange = vi.fn();
    render(<PillToggleGroup options={OPTIONS} value="a" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "B" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("disabled seçenek tıklansa bile onChange çağrılmaz", () => {
    const onChange = vi.fn();
    render(<PillToggleGroup options={OPTIONS} value="a" onChange={onChange} />);
    const disabledButton = screen.getByRole("button", { name: "C" });
    expect(disabledButton).toBeDisabled();
    fireEvent.click(disabledButton);
    expect(onChange).not.toHaveBeenCalled();
  });
});
