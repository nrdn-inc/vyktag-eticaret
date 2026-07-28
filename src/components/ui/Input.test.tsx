// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("label, input'a htmlFor/id ile bağlanır", () => {
    render(<Input label="E-posta" />);
    const input = screen.getByLabelText("E-posta");
    expect(input.tagName).toBe("INPUT");
  });

  it("id verilmezse bile kararlı, benzersiz bir kimlik üretir (useId)", () => {
    render(<Input label="E-posta" />);
    const input = screen.getByLabelText("E-posta");
    expect(input.id).toBeTruthy();
  });

  it("error verildiğinde aria-invalid + role=alert ile bağlanır, description'ın yerini alır", () => {
    render(<Input label="E-posta" description="Size ulaşmak için kullanılır" error="Geçerli bir e-posta girin" />);

    const input = screen.getByLabelText("E-posta");
    expect(input).toHaveAttribute("aria-invalid", "true");

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Geçerli bir e-posta girin");
    expect(input).toHaveAttribute("aria-describedby", alert.id);
    // Hata varken açıklama metni aynı anda gösterilmiyor.
    expect(screen.queryByText("Size ulaşmak için kullanılır")).not.toBeInTheDocument();
  });

  it("hata yokken description gösterilir ve describedby ona işaret eder", () => {
    render(<Input label="E-posta" description="Size ulaşmak için kullanılır" />);
    const input = screen.getByLabelText("E-posta");
    const description = screen.getByText("Size ulaşmak için kullanılır");
    expect(input).toHaveAttribute("aria-describedby", description.id);
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("required olduğunda label'da görsel yıldız gösterir ve input'u required işaretler", () => {
    render(<Input label="Ad Soyad" required />);
    const input = screen.getByLabelText(/Ad Soyad/);
    expect(input).toBeRequired();
  });

  it("onChange ile kontrollü kullanım çalışır", () => {
    const onChange = vi.fn();
    render(<Input label="Ad" value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Ad"), { target: { value: "Ali" } });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("disabled input etkileşimi engeller", () => {
    render(<Input label="Ad" disabled />);
    expect(screen.getByLabelText("Ad")).toBeDisabled();
  });
});
