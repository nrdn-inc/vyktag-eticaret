"use client";

import { useSyncExternalStore } from "react";
import {
  type CartItem,
  addItem as addItemFn,
  cartItemCount,
  cartTotalKurus,
  removeItem as removeItemFn,
  updateQuantity as updateQuantityFn,
} from "@/lib/orders/cart";

const STORAGE_KEY_PREFIX = "vyktag-sepet";
// Giriş/çıkış (bkz. hesap/giris/actions.ts) her zaman tam sayfa yenilemesi (window.location.href)
// tetiklediğinden bu modül her kimlik değişikliğinde sıfırdan yüklenir — kimliği yalnızca ilk
// hydration'da okumak yeterlidir, akış içinde reaktif olarak izlemeye gerek yok.
const CUSTOMER_ID_COOKIE = "vyktag_musteri_kimlik";

/** Giriş yapılmışsa hesap id'sini, değilse null döner (bkz. lib/auth CUSTOMER_ID_COOKIE). */
function readCustomerId(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CUSTOMER_ID_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Sepet, hesaba göre ayrı bir localStorage anahtarında tutulur — aksi halde tarayıcıdaki tek
 * ortak sepet hesaplar arasında sızardı: çıkış yapınca önceki kullanıcının sepeti görünmeye
 * devam eder, farklı bir hesapla giriş yapılınca da o hesaba ait değilmiş sepet miras kalırdı.
 * Misafir (giriş yapılmamış) durumda ayrı, sabit bir anahtar kullanılır.
 */
function storageKey(): string {
  const customerId = readCustomerId();
  return customerId ? `${STORAGE_KEY_PREFIX}:${customerId}` : `${STORAGE_KEY_PREFIX}:misafir`;
}

// Sepet, modül düzeyinde bir harici store'da tutulur ve useSyncExternalStore ile
// bileşenlere bağlanır. Bu API sunucu/istemci anlık görüntülerini ayrı tuttuğu için
// hydration uyumsuzluğu oluşmadan localStorage ile eşitlenir.
let items: CartItem[] = [];
let hydrated = false;
let activeStorageKey = "";
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
    window.localStorage.setItem(activeStorageKey, JSON.stringify(items));
  } catch {
    // Depoya yazılamıyorsa sessizce geç.
  }
}

/** İlk istemci erişiminde, o an giriş yapılmış hesaba ait sepeti localStorage'dan bir kez yükler. */
function ensureHydrated() {
  if (hydrated || typeof window === "undefined") {
    return;
  }
  activeStorageKey = storageKey();
  try {
    let stored = window.localStorage.getItem(activeStorageKey);
    // Geriye dönük uyum: bu değişiklikten önce sepet, hesaptan bağımsız tek bir anahtarda
    // (`vyktag-sepet`) tutuluyordu. Misafir kullanıcının o eski sepeti kaybolmasın diye bir
    // kereliğine yeni misafir anahtarına taşınır. Bir hesaba taşınmaz — bu tam da düzeltilen
    // sızıntı (eski anonim sepetin hesaba miras kalması) olurdu.
    if (stored === null && activeStorageKey === `${STORAGE_KEY_PREFIX}:misafir`) {
      const legacy = window.localStorage.getItem(STORAGE_KEY_PREFIX);
      if (legacy !== null) {
        stored = legacy;
        window.localStorage.setItem(activeStorageKey, legacy);
        window.localStorage.removeItem(STORAGE_KEY_PREFIX);
      }
    }
    items = stored ? (JSON.parse(stored) as CartItem[]) : [];

    // Hesaba giriş yapılmışsa: misafirken sepete eklenmiş ürünler varsa (yani girişten hemen
    // önce, hâlâ bu tarayıcıda) hesabın sepetine bir kereliğine taşınır. Misafir anahtarı hemen
    // sonra temizlenir — aksi halde her sayfa yüklemesinde aynı ürünler tekrar tekrar eklenir.
    const guestKey = `${STORAGE_KEY_PREFIX}:misafir`;
    if (activeStorageKey !== guestKey) {
      const guestStored = window.localStorage.getItem(guestKey);
      if (guestStored) {
        const guestItems = JSON.parse(guestStored) as CartItem[];
        for (const guestItem of guestItems) {
          items = addItemFn(items, guestItem);
        }
        window.localStorage.removeItem(guestKey);
        window.localStorage.setItem(activeStorageKey, JSON.stringify(items));
      }
    }
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
  addItems: (itemsToAdd: CartItem[]) => void;
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
    addItems: (itemsToAdd) => {
      let currentItems = items;
      for (const item of itemsToAdd) {
        currentItems = addItemFn(currentItems, item);
      }
      setItems(currentItems);
    },
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
