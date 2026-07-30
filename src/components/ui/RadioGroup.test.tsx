// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup } from "./RadioGroup";

const OPTIONS = [
  { value: "kart", label: "Kart" },
  { value: "tag", label: "Etiket" },
];

describe("RadioGroup", () => {
  it("legend ve seçenekleri render eder", () => {
    render(<RadioGroup name="urun" label="Ürün türü" options={OPTIONS} />);
    expect(screen.getByText("Ürün türü")).toBeInTheDocument();
    expect(screen.getByLabelText("Kart")).toBeInstanceOf(HTMLInputElement);
    expect(screen.getByLabelText("Etiket")).toBeInstanceOf(HTMLInputElement);
  });

  it("value ile doğru seçenek işaretli gelir", () => {
    render(<RadioGroup name="urun" options={OPTIONS} value="tag" />);
    expect(screen.getByLabelText("Etiket")).toBeChecked();
    expect(screen.getByLabelText("Kart")).not.toBeChecked();
  });

  it("bir seçeneğe tıklanınca onChange seçilen value ile çağrılır", () => {
    const onChange = vi.fn();
    render(<RadioGroup name="urun" options={OPTIONS} value="kart" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Etiket"));
    expect(onChange).toHaveBeenCalledWith("tag");
  });

  it("aynı name ile grup kurulur (native ok tuşu gezinmesi buna dayanır)", () => {
    render(<RadioGroup name="urun" options={OPTIONS} />);
    expect(screen.getByLabelText("Kart")).toHaveAttribute("name", "urun");
    expect(screen.getByLabelText("Etiket")).toHaveAttribute("name", "urun");
  });

  it("error verildiğinde alert olarak duyurulur", () => {
    render(<RadioGroup name="urun" options={OPTIONS} error="Bir seçenek belirleyin" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Bir seçenek belirleyin");
  });

  it("tek bir seçenek disabled ise yalnızca o seçenek devre dışı kalır", () => {
    const disabledOptions = [OPTIONS[0], { ...OPTIONS[1], disabled: true }];
    render(<RadioGroup name="urun" options={disabledOptions} />);
    expect(screen.getByLabelText("Kart")).not.toBeDisabled();
    expect(screen.getByLabelText("Etiket")).toBeDisabled();
  });
});
