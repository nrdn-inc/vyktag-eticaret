// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Alert } from "./Alert";

describe("Alert", () => {
  it("danger varyantı assertive role=alert kullanır", () => {
    render(<Alert variant="danger" title="Hata">Bir şeyler ters gitti.</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveTextContent("Hata");
    expect(alert).toHaveTextContent("Bir şeyler ters gitti.");
  });

  it("info varyantı nazik role=status kullanır (assertive değil)", () => {
    render(<Alert variant="info">Bilgilendirme mesajı.</Alert>);
    const alert = screen.getByRole("status");
    expect(alert).toHaveAttribute("aria-live", "polite");
  });

  it("onDismiss verilirse kapatma butonu görünür ve tetiklenir", () => {
    const onDismiss = vi.fn();
    render(
      <Alert variant="success" onDismiss={onDismiss}>
        Kaydedildi.
      </Alert>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Kapat" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("onDismiss verilmezse kapatma butonu render edilmez", () => {
    render(<Alert variant="success">Kaydedildi.</Alert>);
    expect(screen.queryByRole("button", { name: "Kapat" })).not.toBeInTheDocument();
  });

  it("icon=false ile varsayılan ikon gizlenebilir", () => {
    const { container } = render(
      <Alert variant="info" icon={false}>
        Metin
      </Alert>,
    );
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
