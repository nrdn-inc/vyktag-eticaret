import type { Metadata } from "next";

/**
 * `page.tsx` bir Client Component olduğundan `metadata` export edemez; başlık bu layout'tan
 * verilir. `noindex`: sepet kişiye özel ve arama sonucunda değeri yok — robots.txt taramayı
 * zaten engelliyor, bu meta ise başka bir sayfadan bağlantı verilirse dizine eklenmesini de önler.
 */
export const metadata: Metadata = {
  title: "Sepetiniz",
  robots: { index: false, follow: false },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
