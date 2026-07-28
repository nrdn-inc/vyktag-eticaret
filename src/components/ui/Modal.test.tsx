// @vitest-environment jsdom
import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("open=false iken hiçbir şey render etmez", () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Başlık">
        İçerik
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("open=true iken dialog rolüyle, başlığa aria-labelledby ile bağlı olarak render eder", () => {
    render(
      <Modal open onClose={vi.fn()} title="Adresi sil">
        Bu işlem geri alınamaz.
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    const titleId = dialog.getAttribute("aria-labelledby");
    expect(document.getElementById(titleId!)).toHaveTextContent("Adresi sil");
    expect(screen.getByText("Bu işlem geri alınamaz.")).toBeInTheDocument();
  });

  it("ESC tuşu onClose'u tetikler", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Başlık">
        İçerik
      </Modal>,
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closeOnEsc=false iken ESC hiçbir şey yapmaz", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Başlık" closeOnEsc={false}>
        İçerik
      </Modal>,
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("arka plana (overlay) tıklamak onClose'u tetikler", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Başlık">
        İçerik
      </Modal>,
    );
    const overlay = screen.getByRole("dialog").previousElementSibling as HTMLElement;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("panelin içine tıklamak kapatmaz (overlay'e sızmaz)", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Başlık">
        İçerik
      </Modal>,
    );
    fireEvent.click(screen.getByText("İçerik"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closeOnOverlayClick=false iken overlay tıklaması kapatmaz", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Başlık" closeOnOverlayClick={false}>
        İçerik
      </Modal>,
    );
    const overlay = screen.getByRole("dialog").previousElementSibling as HTMLElement;
    fireEvent.click(overlay);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("kapat (X) butonu onClose'u tetikler", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Başlık">
        İçerik
      </Modal>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Kapat" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("açılınca içerideki ilk odaklanabilir elemana odaklanır", async () => {
    render(
      <Modal open onClose={vi.fn()} title="Başlık">
        <button type="button">Onayla</button>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Onayla" })).toHaveFocus();
    });
  });

  it("kapanınca odağı tetikleyici elemana geri verir", async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Aç
          </button>
          <Modal open={open} onClose={() => setOpen(false)} title="Başlık">
            <button type="button" onClick={() => setOpen(false)}>
              Kapat panelden
            </button>
          </Modal>
        </>
      );
    }
    render(<Harness />);

    // fireEvent.click gerçek bir tarayıcı tıklamasının aksine odağı otomatik taşımaz;
    // bu testte "önceki odak" tam olarak neyse onu simüle etmek için elle odaklıyoruz.
    const openButton = screen.getByRole("button", { name: "Aç" });
    openButton.focus();
    fireEvent.click(openButton);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Kapat panelden" })).toHaveFocus();
    });

    fireEvent.click(screen.getByRole("button", { name: "Kapat panelden" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Aç" })).toHaveFocus();
    });
  });

  it("açıkken body scroll'unu kilitler, kapanınca geri yükler", () => {
    const { rerender } = render(
      <Modal open onClose={vi.fn()} title="Başlık">
        İçerik
      </Modal>,
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <Modal open={false} onClose={vi.fn()} title="Başlık">
        İçerik
      </Modal>,
    );
    expect(document.body.style.overflow).toBe("");
  });
});
