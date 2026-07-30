// @vitest-environment jsdom
import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tab, TabList, TabPanel, Tabs } from "./Tabs";

function renderTabs(overrides: Partial<ComponentProps<typeof Tabs>> = {}) {
  return render(
    <Tabs defaultValue="genel" {...overrides}>
      <TabList aria-label="Ürün bilgisi">
        <Tab value="genel">Genel</Tab>
        <Tab value="teknik">Teknik özellikler</Tab>
        <Tab value="stok" disabled>
          Stok (yakında)
        </Tab>
      </TabList>
      <TabPanel value="genel">Genel içerik</TabPanel>
      <TabPanel value="teknik">Teknik içerik</TabPanel>
      <TabPanel value="stok">Stok içerik</TabPanel>
    </Tabs>,
  );
}

describe("Tabs", () => {
  it("defaultValue'ya karşılık gelen sekme başlangıçta seçili ve paneli görünür gelir", () => {
    renderTabs();
    expect(screen.getByRole("tab", { name: "Genel" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Genel içerik")).toBeVisible();
    expect(screen.getByText("Teknik içerik")).not.toBeVisible();
  });

  it("bir sekmeye tıklanınca seçim ve görünen panel değişir", () => {
    renderTabs();
    fireEvent.click(screen.getByRole("tab", { name: "Teknik özellikler" }));
    expect(screen.getByRole("tab", { name: "Teknik özellikler" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Teknik içerik")).toBeVisible();
    expect(screen.getByText("Genel içerik")).not.toBeVisible();
  });

  it("ArrowRight sonraki sekmeye odak+seçim taşır, ArrowLeft geri taşır", () => {
    renderTabs();
    const genel = screen.getByRole("tab", { name: "Genel" });
    genel.focus();
    fireEvent.keyDown(genel, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Teknik özellikler" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Teknik özellikler" })).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(screen.getByRole("tab", { name: "Teknik özellikler" }), { key: "ArrowLeft" });
    expect(genel).toHaveFocus();
  });

  it("devre dışı sekme ok tuşuyla gezinmede atlanır (wrap-around)", () => {
    renderTabs();
    const teknik = screen.getByRole("tab", { name: "Teknik özellikler" });
    teknik.focus();
    fireEvent.keyDown(teknik, { key: "ArrowRight" });
    // Stok devre dışı olduğu için atlanır, sıradaki gezinilebilir sekme olan Genel'e döner.
    expect(screen.getByRole("tab", { name: "Genel" })).toHaveFocus();
  });

  it("End tuşu son gezinilebilir (devre dışı olmayan) sekmeye atlar", () => {
    renderTabs();
    const genel = screen.getByRole("tab", { name: "Genel" });
    genel.focus();
    fireEvent.keyDown(genel, { key: "End" });
    expect(screen.getByRole("tab", { name: "Teknik özellikler" })).toHaveFocus();
  });

  it("devre dışı sekmeye tıklanınca seçim değişmez", () => {
    renderTabs();
    fireEvent.click(screen.getByRole("tab", { name: "Stok (yakında)" }));
    expect(screen.getByRole("tab", { name: "Genel" })).toHaveAttribute("aria-selected", "true");
  });

  it("value + onValueChange ile kontrollü çalışır — dışarıdan value değişmeden seçim değişmez", () => {
    const onValueChange = vi.fn();
    renderTabs({ value: "genel", onValueChange, defaultValue: undefined });
    fireEvent.click(screen.getByRole("tab", { name: "Teknik özellikler" }));
    expect(onValueChange).toHaveBeenCalledWith("teknik");
    expect(screen.getByRole("tab", { name: "Genel" })).toHaveAttribute("aria-selected", "true");
  });

  it("unmountOnHide=true iken seçili olmayan panel DOM'dan tamamen kaldırılır", () => {
    render(
      <Tabs defaultValue="a">
        <TabList aria-label="Test">
          <Tab value="a">A</Tab>
          <Tab value="b">B</Tab>
        </TabList>
        <TabPanel value="a">A içerik</TabPanel>
        <TabPanel value="b" unmountOnHide>
          B içerik
        </TabPanel>
      </Tabs>,
    );
    expect(screen.queryByText("B içerik")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "B" }));
    expect(screen.getByText("B içerik")).toBeInTheDocument();
  });

  it("Tabs dışında kullanılan Tab, açıklayıcı bir hata fırlatır", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Tab value="x">X</Tab>)).toThrow(/Tabs/);
    consoleError.mockRestore();
  });
});
