import type { Metadata } from "next";

/** page.tsx Client Component olduğundan başlık buradan verilir (bkz. sepet/layout.tsx). */
export const metadata: Metadata = {
  title: "Kayıt Ol",
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
