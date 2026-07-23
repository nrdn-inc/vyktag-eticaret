"use client";

import { useEffect, useRef } from "react";

/**
 * iyzico Checkout Form Initialize'ın döndürdüğü `checkoutFormContent`, iyzico'nun barındırdığı
 * ödeme arayüzünü bir <script> etiketiyle #iyzipay-checkout-form konteynerine gömer.
 * React'in innerHTML ataması script'leri çalıştırmadığından, script düğümlerini elle yeniden
 * oluşturup DOM'a ekliyoruz — bu, iyzico'nun kendi entegrasyon örneklerindeki standart yöntemdir.
 */
export function IyzicoCheckoutForm({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const temp = document.createElement("div");
    temp.innerHTML = content;

    const scripts = Array.from(temp.querySelectorAll("script"));
    scripts.forEach((s) => s.remove());

    container.replaceChildren(...Array.from(temp.childNodes));

    const injectedScripts: HTMLScriptElement[] = [];
    for (const oldScript of scripts) {
      const newScript = document.createElement("script");
      for (const attr of Array.from(oldScript.attributes)) {
        newScript.setAttribute(attr.name, attr.value);
      }
      newScript.textContent = oldScript.textContent;
      document.body.appendChild(newScript);
      injectedScripts.push(newScript);
    }

    return () => {
      injectedScripts.forEach((s) => s.remove());
      container.innerHTML = "";
    };
  }, [content]);

  return <div id="iyzipay-checkout-form" className="responsive" ref={containerRef} />;
}
