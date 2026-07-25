import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest'te `globals: true` kapalı olduğu için Testing Library'nin otomatik temizliği
// devreye girmez; render edilen bileşenler test dosyası boyunca DOM'da birikir ve
// sorgular "found multiple elements" hatası verir. Burada elle temizliyoruz.
// Testlerin çoğu node ortamında çalıştığından (yalnızca bileşen testleri jsdom
// kullanır) DOM yoksa temizlik atlanır.
afterEach(() => {
  if (typeof document !== "undefined") {
    cleanup();
  }
});
