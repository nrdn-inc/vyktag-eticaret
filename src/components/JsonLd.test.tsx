// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { JsonLd } from "./JsonLd";

function scriptOf(container: HTMLElement): HTMLScriptElement {
  const script = container.querySelector<HTMLScriptElement>(
    'script[type="application/ld+json"]',
  );
  if (!script) throw new Error("JSON-LD script bulunamadı");
  return script;
}

describe("JsonLd", () => {
  it("veriyi application/ld+json script'i olarak basar", () => {
    const { container } = render(<JsonLd data={{ "@type": "Product", name: "VYKTag Kart" }} />);
    const script = scriptOf(container);

    expect(JSON.parse(script.innerHTML)).toEqual({ "@type": "Product", name: "VYKTag Kart" });
  });

  it("veri içindeki </script> dizisini kaçışlar (etiketten kaçışı önler)", () => {
    const { container } = render(
      <JsonLd data={{ description: "</script><img src=x onerror=alert(1)>" }} />,
    );
    const script = scriptOf(container);

    // Ham HTML'de kapanış etiketi görünmemeli — aksi halde tarayıcı script'i erken kapatır.
    expect(script.innerHTML).not.toContain("</script>");
    expect(script.innerHTML).not.toContain("<img");
    // Kaçışlanmış olmasına rağmen ayrıştırıldığında orijinal değer korunur.
    expect(JSON.parse(script.innerHTML).description).toBe(
      "</script><img src=x onerror=alert(1)>",
    );
  });
});
