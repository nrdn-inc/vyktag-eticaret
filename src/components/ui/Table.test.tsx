// @vitest-environment jsdom
import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./Table";

function renderOrdersTable(headProps: Partial<ComponentProps<typeof TableHead>> = {}) {
  return render(
    <Table>
      <TableCaption>Son siparişler</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Sipariş no</TableHead>
          <TableHead align="right" {...headProps}>
            Tutar
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>#1001</TableCell>
          <TableCell align="right">₺249,00</TableCell>
        </TableRow>
        <TableRow selected>
          <TableCell>#1002</TableCell>
          <TableCell align="right">₺498,00</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
}

describe("Table", () => {
  it("başlık, gövde ve hücreleri native tablo semantiğiyle render eder", () => {
    renderOrdersTable();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Sipariş no" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "#1001" })).toBeInTheDocument();
    expect(screen.getByText("Son siparişler")).toBeInTheDocument();
  });

  it("satır sayısı doğru (başlık satırı hariç 2 veri satırı)", () => {
    renderOrdersTable();
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3);
  });

  it("sortDirection/onSort verilmeyen başlık düz metin kalır, aria-sort taşımaz", () => {
    renderOrdersTable();
    const header = screen.getByRole("columnheader", { name: "Sipariş no" });
    expect(header).not.toHaveAttribute("aria-sort");
    expect(screen.queryByRole("button", { name: "Sipariş no" })).not.toBeInTheDocument();
  });

  it("onSort verilen başlık bir butona döner ve tıklanınca çağrılır", () => {
    const onSort = vi.fn();
    renderOrdersTable({ onSort, sortDirection: "asc" });
    const sortButton = screen.getByRole("button", { name: "Tutar" });
    fireEvent.click(sortButton);
    expect(onSort).toHaveBeenCalledOnce();
  });

  it("sortDirection değerine göre doğru aria-sort'u üretir", () => {
    const { rerender } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onSort={vi.fn()} sortDirection="asc">
              Tutar
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody />
      </Table>,
    );
    expect(screen.getByRole("columnheader", { name: "Tutar" })).toHaveAttribute("aria-sort", "ascending");

    rerender(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onSort={vi.fn()} sortDirection="desc">
              Tutar
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody />
      </Table>,
    );
    expect(screen.getByRole("columnheader", { name: "Tutar" })).toHaveAttribute("aria-sort", "descending");

    rerender(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onSort={vi.fn()}>Tutar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody />
      </Table>,
    );
    expect(screen.getByRole("columnheader", { name: "Tutar" })).toHaveAttribute("aria-sort", "none");
  });

  it("selected satır farklı bir arkaplan class'ı taşır", () => {
    renderOrdersTable();
    const selectedRow = screen.getByRole("cell", { name: "#1002" }).closest("tr");
    expect(selectedRow?.className).toMatch(/bg-brand\/5/);
  });
});
