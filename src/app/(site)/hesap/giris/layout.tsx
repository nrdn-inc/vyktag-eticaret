import type { Metadata } from "next";

/** page.tsx Client Component olduğundan başlık buradan verilir (bkz. sepet/layout.tsx). */
export const metadata: Metadata = {
  title: "Giriş Yap",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
