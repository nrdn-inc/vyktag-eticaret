"use client";

import { useSyncExternalStore } from "react";
import {
  type CartItem,
  addItem as addItemFn,
  cartItemCount,
  cartTotalKurus,
  removeItem as removeItemFn,
  updateQuantity as updateQuantityFn,
} from "@/lib/cart";

const STORAGE_KEY = "vyktag-sepet";

// Sepet, modül düzeyinde bir harici store'da tutulur ve useSyncExternalStore ile
// bileşenlere bağlanır. Bu API sunucu/istemci anlık görüntülerini ayrı tuttuğu için
// hydration uyumsuzluğu oluşmadan localStorage ile eşitlenir.
let items: CartItem[] = [];
let hydrated = false;
const listeners = new Set<() => void>();
// Referansı değişmeyen boş sepet — sunucu anlık görüntüsü için (sonsuz döngüyü önler).
const SERVER_SNAPSHOT: CartItem[] = [];

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Depoya yazılamıyorsa sessizce geç.
  }
}

/** İlk istemci erişiminde sepeti localStorage'dan bir kez yükler. */
function ensureHydrated() {
  if (hydrated || typeof window === "undefined") {
    return;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    items = stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    items = [];
  }
  hydrated = true;
}

function subscribe(listener: () => void): () => void {
  ensureHydrated();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): CartItem[] {
  ensureHydrated();
  return items;
}

function getServerSnapshot(): CartItem[] {
  return SERVER_SNAPSHOT;
}

function setItems(next: CartItem[]) {
  items = next;
  persist();
  emit();
}

interface CartActions {
  items: CartItem[];
  itemCount: number;
  totalKurus: number;
  /** İstemcide sepet localStorage'dan yüklendi mi (ilk render'da false). */
  ready: boolean;
  addItem: (item: CartItem) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

/** Sepet durumuna ve işlemlerine erişim. */
export function useCart(): CartActions {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Sunucu anlık görüntüsü referansı döndüğü sürece henüz hydrate olmamışız demektir.
  const ready = current !== SERVER_SNAPSHOT;

  return {
    items: current,
    itemCount: cartItemCount(current),
    totalKurus: cartTotalKurus(current),
    ready,
    addItem: (item) => setItems(addItemFn(items, item)),
    updateQuantity: (key, quantity) => setItems(updateQuantityFn(items, key, quantity)),
    removeItem: (key) => setItems(removeItemFn(items, key)),
    clear: () => setItems([]),
  };
}

/**
 * Geriye dönük uyumluluk için sağlanan sarmalayıcı. Sepet artık modül düzeyinde
 * bir store'da tutulduğundan context gerekmez; bileşen yalnızca çocukları render eder.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
