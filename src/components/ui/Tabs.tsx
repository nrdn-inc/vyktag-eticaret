"use client";

import { createContext, useContext, useId, useRef, useState } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  orientation: "horizontal" | "vertical";
  idPrefix: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(componentName: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`<${componentName}>, bir <Tabs> içinde kullanılmalı.`);
  }
  return context;
}

export interface TabsProps {
  children: ReactNode;
  /** Kontrolsüz kullanım için başlangıç değeri. Kontrollü kullanacaksanız bunun yerine `value` verin. */
  defaultValue?: string;
  /** Verilirse bileşen kontrollüdür; `onValueChange` ile birlikte kullanılır. */
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

/**
 * WAI-ARIA "Tabs" deseni (otomatik aktivasyon: ok tuşuyla odak değiştiğinde seçim de değişir).
 * `Tabs` yalnızca durumu ve context'i sağlar; görünüm/klavye mantığı `TabList`/`Tab`/`TabPanel`'de.
 *
 * Kontrolsüz (`defaultValue`) veya kontrollü (`value` + `onValueChange`) kullanılabilir — `Select`
 * ve `Input` gibi bu kitin geri kalanıyla aynı iki-mod alışkanlığı.
 */
export function Tabs({
  children,
  defaultValue,
  value,
  onValueChange,
  orientation = "horizontal",
  className,
}: TabsProps) {
  const idPrefix = useId();
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const currentValue = isControlled ? (value ?? "") : internalValue;

  function setValue(next: string) {
    if (!isControlled) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  }

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue, orientation, idPrefix }}>
      <div className={cn(orientation === "vertical" ? "flex gap-6" : "space-y-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabListProps extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
  /** Sekme grubunun erişilebilir adı — görsel bir başlık yoksa verin. */
  "aria-label"?: string;
}

/**
 * Sekme başlıklarının kapsayıcısı. Ok tuşları (yatayda ←/→, dikeyde ↑/↓) ile gezinme, Home/End
 * ile ilk/son sekmeye atlama burada, tek yerde uygulanır — her `Tab` kendi tuş mantığını
 * tekrarlamaz. Devre dışı sekmeler gezinme sırasında atlanır. Roving tabindex: yalnızca seçili
 * sekme `Tab` tuşu sırasıyla durağı olur, diğerlerine yalnızca ok tuşlarıyla ulaşılır.
 */
export function TabList({ className, ...props }: TabListProps) {
  const { orientation } = useTabsContext("TabList");
  const listRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const isHorizontal = orientation === "horizontal";
    const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";
    const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";

    if (![nextKey, prevKey, "Home", "End"].includes(event.key)) return;

    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]:not([aria-disabled="true"])') ?? [],
    );
    if (tabs.length === 0) return;

    const currentIndex = tabs.indexOf(document.activeElement as HTMLElement);
    let nextIndex: number;
    if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else if (event.key === nextKey) {
      nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % tabs.length;
    } else {
      nextIndex = currentIndex === -1 ? 0 : (currentIndex - 1 + tabs.length) % tabs.length;
    }

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    nextTab.focus();
    // Otomatik aktivasyon: odaklanan sekme seçilir de — `Tab`'ın kendi onClick'i tetiklenir,
    // seçim mantığı iki yerde tekrarlanmaz.
    nextTab.click();
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex gap-1",
        orientation === "vertical"
          ? "shrink-0 flex-col border-r border-border-soft pr-1"
          : "overflow-x-auto border-b border-border-soft",
        className,
      )}
      {...props}
    />
  );
}

export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
}

/** Tek bir sekme başlığı. Seçili olup olmadığı, tıklandığında `Tabs`'ın değerini günceller. */
export function Tab({ value, disabled, className, children, ...props }: TabProps) {
  const { value: selectedValue, setValue, idPrefix, orientation } = useTabsContext("Tab");
  const isSelected = selectedValue === value;
  const tabId = `${idPrefix}-tab-${value}`;
  const panelId = `${idPrefix}-panel-${value}`;

  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      aria-selected={isSelected}
      aria-controls={panelId}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      tabIndex={isSelected ? 0 : -1}
      onClick={() => !disabled && setValue(value)}
      className={cn(
        "shrink-0 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        orientation === "vertical" ? "border-r-2 text-left" : "border-b-2",
        isSelected
          ? "border-brand text-brand"
          : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, "value"> {
  value: string;
  /**
   * `true` verilirse seçili değilken DOM'dan tamamen kaldırılır (pahalı/veri çeken içerik için).
   * Varsayılan `false` — panel `hidden` ile gizlenir ama DOM'da kalır, böylece sekmeler arasında
   * geçiş yapıldığında panel içindeki durum (ör. doldurulmuş bir form) kaybolmaz.
   */
  unmountOnHide?: boolean;
}

export function TabPanel({ value, unmountOnHide = false, className, children, ...props }: TabPanelProps) {
  const { value: selectedValue, idPrefix } = useTabsContext("TabPanel");
  const isSelected = selectedValue === value;
  const tabId = `${idPrefix}-tab-${value}`;
  const panelId = `${idPrefix}-panel-${value}`;

  if (!isSelected && unmountOnHide) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      hidden={!isSelected}
      tabIndex={0}
      className={cn(
        "rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
