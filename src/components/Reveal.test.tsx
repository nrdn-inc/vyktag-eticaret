// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "@/components/Reveal";

/**
 * Reveal yalnızca görsel bir iyileştirmedir. Bu testler asıl riski koruma altına alır:
 * IntersectionObserver hiç tetiklenmese bile içerik görünür hale gelmelidir. Aksi
 * hâlde sayfanın büyük bölümü opacity:0 ile boş görünür.
 */

const originalIO = globalThis.IntersectionObserver;

afterEach(() => {
  globalThis.IntersectionObserver = originalIO;
  vi.useRealTimers();
});

/** Kurulan ama hiçbir zaman geri çağrı yapmayan sahte observer. */
function installSilentObserver() {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
  } as unknown as typeof IntersectionObserver;
}

describe("Reveal", () => {
  it("always renders its children, regardless of visibility state", () => {
    installSilentObserver();
    render(<Reveal>İçerik</Reveal>);

    expect(screen.getByText("İçerik")).toBeInTheDocument();
  });

  it("reveals immediately when the element is already inside the viewport", async () => {
    installSilentObserver();
    // jsdom'da getBoundingClientRect sıfır döner; görünür alanda sayılması için taklit et.
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      top: 10,
      bottom: 200,
    } as unknown as DOMRect);

    const { container } = render(<Reveal>İçerik</Reveal>);

    await waitFor(() => {
      expect(container.querySelector(".reveal")).toHaveClass("is-visible");
    });
  });

  it("falls back to a timeout when the observer never fires and the element is off-screen", async () => {
    installSilentObserver();
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      top: 99_999,
      bottom: 99_999,
    } as unknown as DOMRect);

    const { container } = render(<Reveal>İçerik</Reveal>);
    expect(container.querySelector(".reveal")).not.toHaveClass("is-visible");

    await waitFor(
      () => {
        expect(container.querySelector(".reveal")).toHaveClass("is-visible");
      },
      { timeout: 3000 },
    );
  });

  it("reveals when IntersectionObserver is not supported at all", async () => {
    // @ts-expect-error -- desteklenmeyen tarayıcı senaryosu taklit ediliyor
    delete globalThis.IntersectionObserver;
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      top: 10,
      bottom: 200,
    } as unknown as DOMRect);

    const { container } = render(<Reveal>İçerik</Reveal>);

    await waitFor(() => {
      expect(container.querySelector(".reveal")).toHaveClass("is-visible");
    });
  });
});
