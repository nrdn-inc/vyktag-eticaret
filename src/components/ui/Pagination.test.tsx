// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getPaginationRange, Pagination } from "./Pagination";

describe("getPaginationRange", () => {
  it("totalPages 0 veya altındaysa boş dizi döner", () => {
    expect(getPaginationRange(1, 0)).toEqual([]);
  });

  it("tüm sayfalar sığıyorsa hepsini ellipsis'siz döner", () => {
    expect(getPaginationRange(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("ilk sayfadayken sondan önce tek ellipsis koyar", () => {
    expect(getPaginationRange(1, 10)).toEqual([1, 2, "ellipsis", 10]);
  });

  it("ortadayken her iki yanda da ellipsis koyar", () => {
    expect(getPaginationRange(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
  });

  it("son sayfadayken baştan sonra tek ellipsis koyar", () => {
    expect(getPaginationRange(10, 10)).toEqual([1, "ellipsis", 9, 10]);
  });

  it("siblingCount ile komşu sayfa adedi ayarlanabilir", () => {
    expect(getPaginationRange(5, 10, { siblingCount: 2 })).toEqual([1, "ellipsis", 3, 4, 5, 6, 7, "ellipsis", 10]);
  });
});

describe("Pagination", () => {
  it("totalPages <= 1 iken hiçbir şey render etmez", () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("buton modunda sayfa numaralarını render eder, mevcut sayfa aria-current taşır", () => {
    render(<Pagination page={3} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Sayfa 3" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Sayfa 1" })).not.toHaveAttribute("aria-current");
  });

  it("bir sayfaya tıklanınca onPageChange doğru sayfa numarasıyla çağrılır", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Sayfa 4" }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("ilk sayfadayken önceki oku devre dışıdır (buton değil, tıklanamaz span)", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onPageChange={onPageChange} />);
    expect(screen.queryByRole("button", { name: "Önceki sayfa" })).not.toBeInTheDocument();
  });

  it("son sayfadayken sonraki oku devre dışıdır", () => {
    render(<Pagination page={5} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Sonraki sayfa" })).not.toBeInTheDocument();
  });

  it("sonraki oka tıklanınca bir sonraki sayfa ile çağrılır", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Sonraki sayfa" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("hrefFor modunda öğeleri <a> olarak render eder", () => {
    render(<Pagination page={2} totalPages={5} hrefFor={(p) => `/urunler?sayfa=${p}`} />);
    const link = screen.getByRole("link", { name: "Sayfa 3" });
    expect(link).toHaveAttribute("href", "/urunler?sayfa=3");
  });

  it("renderLink verilirse öğeler onun döndürdüğü elemanla render edilir", () => {
    render(
      <Pagination
        page={1}
        totalPages={3}
        hrefFor={(p) => `/sayfa/${p}`}
        renderLink={({ href, className, children, page: p }) => (
          <a href={href} className={className} data-testid={`custom-link-${p}`}>
            {children}
          </a>
        )}
      />,
    );
    expect(screen.getByTestId("custom-link-3")).toBeInTheDocument();
  });
});
