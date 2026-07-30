// @vitest-environment jsdom
import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("label'a bağlı bir checkbox render eder", () => {
    render(<Checkbox label="Şartları kabul ediyorum" />);
    const checkbox = screen.getByLabelText("Şartları kabul ediyorum");
    expect(checkbox).toBeInstanceOf(HTMLInputElement);
    expect(checkbox).toHaveAttribute("type", "checkbox");
  });

  it("onChange ile işaretleme yakalanır", () => {
    const onChange = vi.fn();
    render(<Checkbox label="Bülten" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Bülten"));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("error verildiğinde aria-invalid ve alert bağlanır", () => {
    render(<Checkbox label="Şartlar" error="Devam etmek için kabul edin" />);
    expect(screen.getByLabelText("Şartlar")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Devam etmek için kabul edin");
  });

  it("disabled prop'u native disabled özelliğine bağlanır", () => {
    render(<Checkbox label="Bülten" disabled />);
    expect(screen.getByLabelText("Bülten")).toBeDisabled();
  });

  it("ref'i gerçek DOM elemanına iletir (indeterminate gibi imperatif ayarlar için)", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox label="Tümünü seç" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
