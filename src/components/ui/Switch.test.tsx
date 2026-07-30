// @vitest-environment jsdom
import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("role=switch ile label'a bağlı render edilir", () => {
    render(<Switch label="İki adımlı doğrulama" />);
    const toggle = screen.getByRole("switch", { name: "İki adımlı doğrulama" });
    expect(toggle).toBeInstanceOf(HTMLInputElement);
  });

  it("onChange ile durum değişikliği yakalanır", () => {
    const onChange = vi.fn();
    render(<Switch label="Bildirimler" onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch", { name: "Bildirimler" }));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("checked prop'u ile kontrollü çalışır", () => {
    render(<Switch label="Bildirimler" checked readOnly />);
    expect(screen.getByRole("switch", { name: "Bildirimler" })).toBeChecked();
  });

  it("description varsa aria-describedby ile bağlanır", () => {
    render(<Switch label="Bildirimler" description="E-posta ile özet gönderilir." />);
    const toggle = screen.getByRole("switch", { name: "Bildirimler" });
    const describedBy = toggle.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent("E-posta ile özet gönderilir.");
  });

  it("disabled prop'u native disabled özelliğine bağlanır", () => {
    render(<Switch label="Bildirimler" disabled />);
    expect(screen.getByRole("switch", { name: "Bildirimler" })).toBeDisabled();
  });

  it("ref'i gerçek DOM elemanına iletir", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Switch label="Bildirimler" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
